import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import confusion_matrix, accuracy_score, precision_recall_fscore_support
from model import ReimbursementModel
import logging
import os
import json
from torch.nn.functional import softmax
from datetime import datetime
import joblib

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def extract_features(bulletin, client):
    try:
        # Extract and convert bulletin fields with fallbacks
        sessions_attended = bulletin["treatmentDetails"]["sessionsAttended"]
        if isinstance(sessions_attended, str):
            try:
                sessions_attended = int(sessions_attended)
            except ValueError:
                logger.warning(f"Invalid sessionsAttended '{sessions_attended}', defaulting to 0")
                sessions_attended = 0
        elif not isinstance(sessions_attended, (int, float)):
            logger.warning(f"Unexpected type for sessionsAttended: {type(sessions_attended)}, defaulting to 0")
            sessions_attended = 0

        total_amount_paid = bulletin["financialInfo"]["totalAmountPaid"]
        if isinstance(total_amount_paid, str):
            try:
                total_amount_paid = float(total_amount_paid)
            except ValueError:
                logger.warning(f"Invalid totalAmountPaid '{total_amount_paid}', defaulting to 0.0")
                total_amount_paid = 0.0
        elif not isinstance(total_amount_paid, (int, float)):
            logger.warning(f"Unexpected type for totalAmountPaid: {type(total_amount_paid)}, defaulting to 0.0")
            total_amount_paid = 0.0

        case_severity = bulletin["treatmentDetails"]["caseSeverity"]
        if isinstance(case_severity, str):
            try:
                case_severity = int(case_severity)
            except ValueError:
                logger.warning(f"Invalid caseSeverity '{case_severity}', defaulting to 0")
                case_severity = 0
        elif not isinstance(case_severity, (int, float)):
            logger.warning(f"Unexpected type for caseSeverity: {type(case_severity)}, defaulting to 0")
            case_severity = 0
        case_severity = max(0, min(5, case_severity))  # Clamp to schema range [0, 5]

        treatment_duration = bulletin["treatmentDetails"].get("treatmentDuration", "1 month")

        # Extract client fields
        birth_date = client["birthDate"]
        health_conditions = len(client["health"]["conditions"].split()) if client["health"].get("conditions") else 0
        smoker = 1 if client["health"]["smoker"] else 0
        exercise_map = {"Often": 2, "Sometimes": 1, "Never": 0}
        exercise = exercise_map.get(client["health"]["exercise"], 0)
        plan_min = client["plan"]["range"]["min"] / 100
        plan_max = client["plan"]["range"]["max"] / 100

        # Calculate age from birthDate
        if isinstance(birth_date, str):
            birth_date = datetime.fromisoformat(birth_date.replace('Z', '+00:00'))
        today = datetime.now(birth_date.tzinfo)
        age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))

        # Encode case severity
        severity_map = {0: [1, 0, 0], 1: [1, 0, 0], 2: [0, 1, 0], 3: [0, 1, 0], 4: [0, 0, 1], 5: [0, 0, 1]}
        severity_encoded = severity_map.get(case_severity, [1, 0, 0])

        # Parse treatment duration
        try:
            if isinstance(treatment_duration, str):
                duration_parts = treatment_duration.split()
                duration_value = float(duration_parts[0])
                duration_unit = duration_parts[1].lower() if len(duration_parts) > 1 else "month"
                duration_months = duration_value / 4 if duration_unit in ["week", "weeks"] else duration_value
            else:
                duration_months = 1
        except (ValueError, IndexError):
            logger.warning(f"Invalid treatmentDuration '{treatment_duration}', defaulting to 1 month")
            duration_months = 1

        features = [
            float(sessions_attended),
            float(total_amount_paid),
            float(age),
            float(health_conditions),
            float(smoker),
            float(exercise),
            float(severity_encoded[0]),
            float(severity_encoded[1]),
            float(severity_encoded[2]),
            float(duration_months),
            float(plan_min),
            float(plan_max)
        ]
        logger.debug(f"Extracted features: {features}")
        return np.array(features, dtype=np.float32)
    except Exception as e:
        logger.error(f"Feature extraction failed: {str(e)}")
        raise

def load_json_data(clients_path, bulletins_path):
    try:
        with open(clients_path, 'r') as f:
            clients_data = json.load(f)
        with open(bulletins_path, 'r') as f:
            bulletins_data = json.load(f)
        logger.info(f"Loaded {len(clients_data)} clients and {len(bulletins_data)} bulletins from JSON")
        return clients_data, bulletins_data
    except Exception as e:
        logger.error(f"Failed to load JSON data: {str(e)}")
        raise

def train_model(db, model, model_path):
    logger.info("Starting train_model...")
    clients_path = "./dummyObjs/clients.json"
    bulletins_path = "./dummyObjs/medicalBulletins.json"
    if not (os.path.exists(clients_path) and os.path.exists(bulletins_path)):
        logger.error("JSON data files not found.")
        return

    clients_data, bulletins_data = load_json_data(clients_path, bulletins_path)
    clients = {str(c["_id"]): c for c in clients_data}
    logger.info(f"Loaded {len(bulletins_data)} bulletins and {len(clients)} clients")

    features = []
    class_labels = []
    reimbursement_targets = []

    # Check class distribution
    class_counts = {"Low": 0, "Medium": 0, "High": 0}
    for bulletin in bulletins_data:
        if "reimbursementClass" in bulletin:
            class_counts[bulletin["reimbursementClass"]] += 1
    logger.info(f"Initial class distribution: {class_counts}")
    if any(count == 0 for count in class_counts.values()):
        logger.warning("One or more classes have zero samples. Model may overpredict dominant class.")

    for bulletin in bulletins_data:
        client = clients.get(str(bulletin["clientId"]))
        if not client:
            logger.warning(f"Client not found for bulletin {bulletin['_id']}")
            continue
        if "reimbursementClass" not in bulletin:
            logger.warning(f"No reimbursementClass for bulletin {bulletin['_id']}")
            continue
        class_map = {"Low": 0, "Medium": 1, "High": 2}
        class_label = class_map.get(bulletin["reimbursementClass"])
        if class_label is None:
            logger.warning(f"Invalid reimbursementClass for bulletin {bulletin['_id']}")
            continue
        try:
            feature_vector = extract_features(bulletin, client)
            features.append(feature_vector)
            class_labels.append(class_label)
            total_paid = bulletin["financialInfo"]["totalAmountPaid"]
            if isinstance(total_paid, str):
                try:
                    total_paid = float(total_paid)
                except ValueError:
                    total_paid = 0.0
            reimbursement_amount = bulletin.get("reimbursementAmount", 0)
            if isinstance(reimbursement_amount, str):
                try:
                    reimbursement_amount = float(reimbursement_amount)
                except ValueError:
                    reimbursement_amount = 0.0
            reimb_pct = reimbursement_amount / total_paid if total_paid > 0 else 0
            reimbursement_targets.append(reimb_pct)
        except Exception as e:
            logger.error(f"Error processing bulletin {bulletin['_id']}: {str(e)}")
            continue

    logger.info(f"Collected {len(features)} valid samples for training")
    if not features:
        logger.error("No valid data available for training.")
        return

    scaler = StandardScaler()
    X = scaler.fit_transform(np.array(features))
    joblib.dump(scaler, "models/scaler.pkl")
    y_class = np.array(class_labels)
    y_reimbursement = np.array(reimbursement_targets, dtype=np.float32)

    # Log class distribution
    class_counts = np.bincount(y_class, minlength=3)
    logger.info(f"Class distribution: Low={class_counts[0]}, Medium={class_counts[1]}, High={class_counts[2]}")

    X_temp, X_test, y_class_temp, y_class_test, y_reimb_temp, y_reimb_test = train_test_split(
        X, y_class, y_reimbursement, test_size=0.15, random_state=42
    )
    X_train, X_val, y_class_train, y_class_val, y_reimb_train, y_reimb_val = train_test_split(
        X_temp, y_class_temp, y_reimb_temp, test_size=0.1765, random_state=42
    )

    logger.info(f"Training set: {len(X_train)} samples, Validation set: {len(X_val)} samples, Test set: {len(X_test)} samples")

    X_train_tensor = torch.tensor(X_train, dtype=torch.float32)
    y_class_train_tensor = torch.tensor(y_class_train, dtype=torch.long)
    y_reimb_train_tensor = torch.tensor(y_reimb_train, dtype=torch.float32)
    X_val_tensor = torch.tensor(X_val, dtype=torch.float32)
    y_class_val_tensor = torch.tensor(y_class_val, dtype=torch.long)
    y_reimb_val_tensor = torch.tensor(y_reimb_val, dtype=torch.float32)
    X_test_tensor = torch.tensor(X_test, dtype=torch.float32)
    y_class_test_tensor = torch.tensor(y_class_test, dtype=torch.long)

    optimizer = torch.optim.Adam(model.parameters(), lr=0.001, weight_decay=1e-4)
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='min', factor=0.5, patience=5)
    class_weights = 1.0 / class_counts
    class_weights = class_weights / class_weights.sum() * len(class_weights)
    class_criterion = torch.nn.CrossEntropyLoss(weight=torch.tensor(class_weights, dtype=torch.float32))
    reimb_criterion = torch.nn.MSELoss()

    model.train()
    best_val_loss = float('inf')
    patience = 10
    patience_counter = 0

    for epoch in range(30):
        optimizer.zero_grad()
        class_logits, reimb_pred = model(X_train_tensor)
        class_loss = class_criterion(class_logits, y_class_train_tensor)
        reimb_loss = reimb_criterion(reimb_pred.squeeze(), y_reimb_train_tensor)
        loss = class_loss + reimb_loss
        loss.backward()
        optimizer.step()

        if epoch % 5 == 0:
            model.eval()
            with torch.no_grad():
                val_class_logits, val_reimb_pred = model(X_val_tensor)
                val_class_pred = torch.argmax(val_class_logits, dim=1)
                val_accuracy = accuracy_score(y_class_val, val_class_pred.numpy())
                val_class_loss = class_criterion(val_class_logits, y_class_val_tensor)
                val_reimb_loss = reimb_criterion(val_reimb_pred.squeeze(), y_reimb_val_tensor)
                val_loss = val_class_loss + val_reimb_loss
                logger.info(f"Epoch {epoch}: Validation Accuracy: {val_accuracy:.4f}, Validation Loss: {val_loss:.4f}")

                scheduler.step(val_loss)
                if val_loss < best_val_loss:
                    best_val_loss = val_loss
                    patience_counter = 0
                    os.makedirs(os.path.dirname(model_path), exist_ok=True)
                    torch.save(model.state_dict(), model_path)
                    joblib.dump(scaler, "models/scaler.pkl")
                    model_version = "1.0"
                    version_file = "models/version.txt"
                    if os.path.exists(version_file):
                        with open(version_file, "r") as f:
                            model_version = str(float(f.read().strip()) + 0.1)
                    with open(version_file, "w") as f:
                        f.write(model_version)
                    logger.info(f"Model saved to {model_path} (version {model_version})")
                else:
                    patience_counter += 1
                    if patience_counter >= patience:
                        logger.info(f"Early stopping at epoch {epoch}")
                        break
            model.train()

    model.eval()
    with torch.no_grad():
        test_class_logits, _ = model(X_test_tensor)
        temperature = 2.0
        test_scaled_logits = test_class_logits / temperature
        test_probabilities = softmax(test_scaled_logits, dim=1)
        test_class_pred = torch.argmax(test_probabilities, dim=1)
        test_confidences = test_probabilities.max(dim=1)[0].numpy()

        accuracy = accuracy_score(y_class_test, test_class_pred.numpy())
        precision, recall, f1, _ = precision_recall_fscore_support(
            y_class_test, test_class_pred.numpy(), average='weighted', zero_division=0
        )
        conf_matrix = confusion_matrix(y_class_test, test_class_pred.numpy())

        logger.info("Test Set Evaluation Metrics:")
        logger.info(f"Accuracy: {accuracy:.4f}")
        logger.info(f"Precision: {precision:.4f}")
        logger.info(f"Recall: {recall:.4f}")
        logger.info(f"F1-Score: {f1:.4f}")
        logger.info("Confusion Matrix (rows: actual, columns: predicted):")
        logger.info(f"{conf_matrix}")
        logger.info(f"Average Confidence: {np.mean(test_confidences):.4f}")
        logger.info(f"Confidence Range: [{np.min(test_confidences):.4f}, {np.max(test_confidences):.4f}]")

if __name__ == "__main__":
    model_path = "models/reimbursement_model.pth"
    model = ReimbursementModel(input_size=12)
    train_model(None, model, model_path)
    logger.info("Training complete")