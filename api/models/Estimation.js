import mongoose from "mongoose";

const estimationSchema = new mongoose.Schema({
  insurerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  clientName: {
    type: String,
    required: true,
  },
  clientEmail: {
    type: String,
    required: true,
  },
  medicalBulletinId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MedicalBulletin",
    required: true,
  },
  reimbursementClass: {
    type: String,
    enum: ["Low", "Medium", "High"],
    required: true,
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    required: true,
  },
  reimbursementAmount: {
    type: Number,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  modelVersion: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Estimation", estimationSchema);
