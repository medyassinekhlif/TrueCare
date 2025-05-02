import mongoose from "mongoose";

const clientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  name: { type: String, required: true },
  birthDate: { type: Date, required: true },
  nationalId: { type: String, required: true, unique: true },
  job: { type: String, required: true },
  health: {
    conditions: { type: String },
    smoker: { type: Boolean, default: false },
    exercise: {
      type: String,
      enum: ["Often", "Sometimes", "Never"],
      default: "Sometimes",
    },
  },
  insurer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Insurer",
    required: true,
  },
  plan: {
    range: {
      min: { type: Number, min: 0, max: 100 },
      max: { type: Number, min: 0, max: 100 },
    },
  },
  medicalDocs: [
    { type: mongoose.Schema.Types.ObjectId, ref: "MedicalBulletin" },
  ],
});


export default mongoose.model("Client", clientSchema);
