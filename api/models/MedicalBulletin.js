import mongoose from 'mongoose';

const medicalBulletinSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  clientId: { type: String, required: true },
  patientInfo: {
    fullName: String,
    dateOfBirth: Date,
    retired: Boolean,
    assuranceCompany: String
  },
  treatmentDetails: {
    diagnosis: String,
    sessionsAttended: Number,
    treatmentDuration: String,
    treatmentType: String,
    caseSeverity: { type: String, enum: ['Mild', 'Moderate', 'Severe'] }
  },
  financialInfo: {
    totalAmountPaid: Number
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('MedicalBulletin', medicalBulletinSchema);