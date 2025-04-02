import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Insurer from '../models/Insurer.js';
import MedicalBulletin from '../models/MedicalBulletin.js';

export const signupInsurer = async (req, res) => {
  try {
    const { email, password, companyName } = req.body;
    const user = await User.create({ email, password, role: 'insurer' });
    const insurer = await Insurer.create({ userId: user._id, companyName });
    res.status(201).json({ message: 'Insurer created successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const loginInsurer = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, role: 'insurer' });
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id, role: 'insurer' }, process.env.JWT);
    res.json({ token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const addClient = async (req, res) => {
  try {
    const insurer = await Insurer.findOne({ userId: req.user.id });
    insurer.clients.push(req.body);
    await insurer.save();
    res.status(201).json({ message: 'Client added successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateClient = async (req, res) => {
  try {
    const insurer = await Insurer.findOneAndUpdate(
      { userId: req.user.id, 'clients.clientId': req.params.clientId },
      { $set: { 'clients.$': req.body } },
      { new: true }
    );
    res.json({ message: 'Client updated successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getDashboard = async (req, res) => {
  try {
    const insurer = await Insurer.findOne({ userId: req.user.id })
      .populate('clients.medicalDocuments');
    res.json({
      companyName: insurer.companyName,
      financialInfo: insurer.financialInfo,
      clients: insurer.clients
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getClientMedicalDocuments = async (req, res) => {
  try {
    const insurer = await Insurer.findOne({ userId: req.user.id });
    const client = insurer.clients.find(c => c.clientId === req.params.clientId);
    const medicalDocs = await MedicalBulletin.find({ clientId: client.clientId });
    res.json(medicalDocs);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};