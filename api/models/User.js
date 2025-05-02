import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['insurer', 'doctor', 'client'], required: true },
  image: { type: String, default: '' },
  phoneNumber: { type: String, required: true, unique: true },
  created: { type: Date, default: Date.now },
});

userSchema.pre('save', async function (next) {
  if (this.isModified('password') && !this.password.startsWith('$2b$')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

export default mongoose.model('User', userSchema);