import mongoose from 'mongoose';

const insurerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyName: { type: String, required: true },
  financialInfo: {
    policyReimbursementMargin: { type: Number, min: 70, max: 90 },
    finalReimbursementPercentage: { type: Number, default: 85 }
  },
  clients: [{
    fullName: String,
    dateOfBirth: Date,
    clientId: { type: String, unique: true },
    retired: Boolean,
    medicalDocuments: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicalBulletin'
    }]
  }]
});

export default mongoose.model('Insurer', insurerSchema);