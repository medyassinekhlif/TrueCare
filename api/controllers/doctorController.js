import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import MedicalBulletin from '../models/MedicalBulletin.js';
import Insurer from '../models/Insurer.js';

export const signupDoctor = async (req, res) => {
  try {
    const { email, password, fullName, specialty } = req.body;
    const user = await User.create({ email, password, role: 'doctor' });
    const doctor = await Doctor.create({ userId: user._id, fullName, specialty });
    res.status(201).json({ message: 'Doctor created successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, role: 'doctor' });
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id, role: 'doctor' }, process.env.JWT);
    res.json({ token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const createMedicalBulletin = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.id });
    const insurer = await Insurer.findOne({ 'clients.clientId': req.body.clientId });
    
    if (!insurer) {
      return res.status(404).json({ message: 'Client not found in any insurer database' });
    }

    const bulletin = await MedicalBulletin.create({
      doctorId: doctor._id,
      ...req.body
    });

    const client = insurer.clients.find(c => c.clientId === req.body.clientId);
    client.medicalDocuments.push(bulletin._id);
    await insurer.save();

    res.status(201).json({ message: 'Medical bulletin created successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};