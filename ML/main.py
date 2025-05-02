from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pymongo
from bson.objectid import ObjectId, InvalidId
import torch
from torch.nn.functional import softmax
import numpy as np
from apscheduler.schedulers.asyncio import AsyncIOScheduler
import asyncio
from model import ReimbursementModel
from train import extract_features
import joblib
import logging
from datetime import datetime
import os

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI()

# MongoDB connection
try:
    client = pymongo.MongoClient("mongodb+srv://khlifyassin55:WebRTC55555@cluster.skokpsh.mongodb.net/true", serverSelectionTimeoutMS=5000)
    client.admin.command('ping')
    db = client["true"]
    logger.info("MongoDB connection established")
    collections = db.list_collection_names()
    logger.info(f"Available collections: {collections}")
except Exception as e:
    logger.error(f"Failed to connect to MongoDB: {str(e)}")
    raise Exception("MongoDB connection failed")

# Load model and scaler
model_path = "models/reimbursement_model.pth"
scaler_path = "models/scaler.pkl"
try:
    model = ReimbursementModel(input_size=12)
    if os.path.exists(model_path):
        model.load_state_dict(torch.load(model_path, map_location=torch.device('cpu')))
        logger.info(f"Model loaded from {model_path}")
    else:
        logger.warning(f"No model found at {model_path}. Using untrained model.")
    model.eval()
    scaler = joblib.load(scaler_path) if os.path.exists(scaler_path) else None
    if not scaler:
        logger.warning("Scaler not found. Features will not be scaled.")
except Exception as e:
    logger.error(f"Failed to load model or scaler: {str(e)}")
    raise Exception("Model loading failed")

# Load model version
model_version = "1.0"
version_file = "models/version.txt"
try:
    if os.path.exists(version_file):
        with open(version_file, "r") as f:
            model_version = f.read().strip()
        logger.info(f"Loaded model version: {model_version}")
except Exception as e:
    logger.error(f"Failed to load model version: {str(e)}")

class MedicalBulletinInput(BaseModel):
    client_id: str
    medical_bulletin_id: str

@app.post("/predict")
async def predict_reimbursement(data: MedicalBulletinInput):
    logger.info(f"Received prediction request: client_id={data.client_id}, medical_bulletin_id={data.medical_bulletin_id}")
    try:
        # Validate ObjectIds
        try:
            client_obj_id = ObjectId(data.client_id)
            bulletin_obj_id = ObjectId(data.medical_bulletin_id)
        except InvalidId as e:
            logger.error(f"Invalid ObjectId: {str(e)}")
            raise HTTPException(status_code=400, detail="Invalid client_id or medical_bulletin_id")

        # Check for existing estimation
        existing_estimation = db["estimations"].find_one({"medicalBulletinId": bulletin_obj_id})
        if existing_estimation:
            logger.info(f"Estimation already exists for medical bulletin ID: {data.medical_bulletin_id}")
            return {
                "reimbursementClass": existing_estimation["reimbursementClass"],
                "confidence": existing_estimation["confidence"],
                "reimbursementAmount": existing_estimation["reimbursementAmount"],
                "modelVersion": existing_estimation["modelVersion"]
            }

        # Fetch medical bulletin
        bulletin = db["medicalbulletins"].find_one({"_id": bulletin_obj_id})
        if not bulletin:
            logger.error(f"Medical bulletin not found for ID: {data.medical_bulletin_id}")
            raise HTTPException(status_code=404, detail=f"Medical bulletin not found for ID: {data.medical_bulletin_id}")

        # Fetch client
        client = db["clients"].find_one({"_id": client_obj_id})
        if not client:
            logger.error(f"Client not found for ID: {data.client_id}")
            raise HTTPException(status_code=404, detail=f"Client not found for ID: {data.client_id}")

        # Validate client ID in bulletin
        if str(bulletin["clientId"]) != str(client["_id"]):
            logger.error(f"Medical bulletin clientId {bulletin['clientId']} does not match client _id {client['_id']}")
            raise HTTPException(status_code=400, detail="Medical bulletin clientId does not match client ID")

        # Fetch insurer
        insurer = db["insurers"].find_one({"clients.clientId": client_obj_id})
        if not insurer:
            logger.error(f"Insurer not found for client ID: {client_obj_id}")
            raise HTTPException(status_code=404, detail=f"Insurer not found for client ID: {client_obj_id}")

        # Fetch user for email
        user = db["users"].find_one({"_id": client["userId"]})
        if not user:
            logger.error(f"User not found for ID: {client['userId']}")
            raise HTTPException(status_code=404, detail=f"User not found for ID: {client['userId']}")

        # Validate bulletin fields
        try:
            if not isinstance(bulletin["treatmentDetails"]["sessionsAttended"], int):
                raise ValueError(f"sessionsAttended must be an integer, got {type(bulletin['treatmentDetails']['sessionsAttended'])}: {bulletin['treatmentDetails']['sessionsAttended']}")
            if not isinstance(bulletin["treatmentDetails"]["caseSeverity"], int):
                raise ValueError(f"caseSeverity must be an integer, got {type(bulletin['treatmentDetails']['caseSeverity'])}: {bulletin['treatmentDetails']['caseSeverity']}")
            if not isinstance(bulletin["financialInfo"]["totalAmountPaid"], (int, float)):
                raise ValueError(f"totalAmountPaid must be a number, got {type(bulletin['financialInfo']['totalAmountPaid'])}: {bulletin['financialInfo']['totalAmountPaid']}")
        except (KeyError, TypeError) as e:
            logger.error(f"Invalid bulletin structure: {str(e)}")
            raise HTTPException(status_code=400, detail=f"Invalid bulletin structure: {str(e)}")

        # Extract and scale features
        try:
            features = extract_features(bulletin, client)
            if scaler is not None:
                features = scaler.transform(features.reshape(1, -1)).flatten()
            else:
                logger.warning("No scaler applied to features.")
            features_tensor = torch.tensor(features, dtype=torch.float32)
        except Exception as e:
            logger.error(f"Feature extraction failed: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Feature extraction failed: {str(e)}")

        # Make prediction with temperature scaling
        try:
            with torch.no_grad():
                class_logits, reimbursement = model(features_tensor)
                temperature = 2.0
                scaled_logits = class_logits / temperature
                probabilities = softmax(scaled_logits + 1e-10, dim=0)
                class_idx = torch.argmax(probabilities).item()
                confidence = probabilities[class_idx].item()
                logger.info(f"Raw logits: {class_logits.tolist()}, Scaled logits: {scaled_logits.tolist()}, Probabilities: {probabilities.tolist()}")
                reimb_pct = reimbursement.item()
                reimbursement_amount = reimb_pct * bulletin["financialInfo"]["totalAmountPaid"]
        except Exception as e:
            logger.error(f"Prediction failed: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

        class_labels = ["Low", "Medium", "High"]
        reimbursement_class = class_labels[class_idx]

        # Save estimation
        estimation = {
            "insurerId": insurer["userId"],
            "clientId": client["userId"],
            "clientName": client["name"],
            "clientEmail": user["email"],
            "medicalBulletinId": bulletin["_id"],
            "reimbursementClass": reimbursement_class,
            "confidence": confidence,
            "reimbursementAmount": reimbursement_amount,
            "createdBy": insurer["userId"],
            "modelVersion": model_version,
            "createdAt": datetime.utcnow()
        }
        try:
            db["estimations"].insert_one(estimation)
            logger.info(f"Estimation saved: class={reimbursement_class}, confidence={confidence:.4f}, amount={reimbursement_amount:.2f}")
        except Exception as e:
            logger.error(f"Failed to save estimation: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to save estimation: {str(e)}")

        return {
            "reimbursementClass": reimbursement_class,
            "confidence": confidence,
            "reimbursementAmount": reimbursement_amount,
            "modelVersion": model_version
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

async def retrain_model():
    logger.info("Starting model retraining...")
    try:
        bulletins_count = db["medicalbulletins"].count_documents({})
        if bulletins_count < 50:
            logger.info("Insufficient data for retraining. Skipping.")
            return
        from train import train_model
        train_model(None, model, model_path)  # Train from JSON only
        model.load_state_dict(torch.load(model_path, map_location=torch.device('cpu')))
        model.eval()
        global scaler
        scaler = joblib.load(scaler_path) if os.path.exists(scaler_path) else None
        global model_version
        if os.path.exists(version_file):
            with open(version_file, "r") as f:
                model_version = f.read().strip()
        logger.info(f"Model retrained and reloaded, version: {model_version}")
    except Exception as e:
        logger.error(f"Model retraining failed: {str(e)}")

scheduler = AsyncIOScheduler()
scheduler.add_job(retrain_model, 'interval', days=1)
scheduler.start()

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting FastAPI server...")
    uvicorn.run(app, host="0.0.0.0", port=8000)