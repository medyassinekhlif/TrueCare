import mongoose from 'mongoose';

const insurerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  companyName: { type: String, required: true },
  verified: { type: Boolean, default: false },
  businessRegistration: { type: String, required: true },
  insuranceLicense: { type: String, required: true },
  taxId: { type: String, required: true },
  address: { type: String, required: true },
  website: { type: String },
  authorizedRepresentative: {
    photoId: { type: String, required: true },
    authorizationLetter: { type: String, required: true },
  },
  plans: [
    {
      range: {
        min: { type: Number, min: 0, max: 100 },
        max: { type: Number, min: 0, max: 100 },
      },
      maxCoverage: { type: Number },
    },
  ],
  clients: [
    {
      clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true,
      },
    },
  ],
});

export default mongoose.model('Insurer', insurerSchema);