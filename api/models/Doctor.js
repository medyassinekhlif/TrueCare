import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  fullName: { type: String, required: true },
  specialty: { type: String, required: true },
  verified: { type: Boolean, default: false },
  nationalIdOrPassport: { type: String, required: true },
  medicalLicense: { type: String, required: true },
  npiNumber: { type: String, required: true },
  proofOfPractice: { type: String, required: true },
  taxIdOrBusinessRegistration: { type: String, required: true },
});

export default mongoose.model('Doctor', doctorSchema);