import mongoose from "mongoose";

const medicalBulletinSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
    required: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  treatmentDetails: {
    diagnosis: { type: String, required: true },
    sessionsAttended: { type: Number, default: 0 },
    treatmentDuration: { type: String },
    treatmentType: { type: String },
    caseSeverity: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
  },
  financialInfo: {
    totalAmountPaid: { type: Number, required: true },
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("MedicalBulletin", medicalBulletinSchema);


