import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fullName: { type: String, required: true },
  specialty: String,
});

export default mongoose.model('Doctor', doctorSchema);