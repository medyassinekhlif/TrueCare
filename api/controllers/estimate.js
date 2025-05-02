import mongoose from 'mongoose';
import Insurer from '../models/Insurer.js';
import Client from '../models/Client.js';
import MedicalBulletin from '../models/MedicalBulletin.js';
import Estimation from '../models/Estimation.js';
import User from '../models/User.js';
import axios from 'axios';

export const estimateReimbursement = async (req, res) => {
  try {
    const { clientId, medicalBulletinId } = req.body;

    // Validate IDs
    if (!clientId || !mongoose.isValidObjectId(clientId)) {
      return res.status(400).json({ message: 'Invalid Client ID' });
    }
    if (!medicalBulletinId || !mongoose.isValidObjectId(medicalBulletinId)) {
      return res.status(400).json({ message: 'Invalid Medical Bulletin ID' });
    }

    // Find the insurer based on the logged-in user's ID
    const insurer = await Insurer.findOne({ userId: req.user.id }).lean();
    if (!insurer) {
      return res.status(404).json({ message: 'Insurer not found' });
    }
    if (!insurer.verified) {
      return res.status(403).json({ message: 'Insurer account not verified' });
    }

    // Find the client by ID and verify association with the insurer
    const client = await Client.findById(clientId).lean();
    if (
      !client ||
      !insurer.clients.some((c) => c.clientId && c.clientId.equals(client._id))
    ) {
      return res.status(404).json({
        message: 'Client not found or not associated with this insurer',
      });
    }

    // Find the medical bulletin and verify it belongs to the client
    const medicalBulletin = await MedicalBulletin.findById(medicalBulletinId).lean();
    if (
      !medicalBulletin ||
      !medicalBulletin.clientId.equals(client._id)
    ) {
      return res.status(404).json({
        message: 'Medical bulletin not found or not associated with this client',
      });
    }

    // Check for existing estimation
    const existingEstimation = await Estimation.findOne({ medicalBulletinId }).lean();
    if (existingEstimation) {
      return res.json({
        message: 'Reimbursement estimation already exists',
        estimation: existingEstimation,
        totalAmountPaid: medicalBulletin.financialInfo.totalAmountPaid,
        plan: client.plan,
      });
    }

    // Send request to ML backend
    try {
      const response = await axios.post('http://localhost:8000/predict', {
        client_id: client._id.toHexString(),
        medical_bulletin_id: medicalBulletinId,
      });

      // Validate ML response
      if (!response.data.reimbursementClass || !response.data.reimbursementAmount) {
        return res.status(500).json({ message: 'Invalid ML backend response' });
      }

      // Find user for email
      const user = await User.findById(client.userId).lean();
      if (!user) {
        return res.status(404).json({ message: 'User not found for client' });
      }

      // Create and save estimation
      const estimation = await Estimation.create({
        insurerId: insurer.userId,
        clientId: client.userId,
        clientName: client.name,
        clientEmail: user.email,
        medicalBulletinId,
        reimbursementClass: response.data.reimbursementClass,
        confidence: response.data.confidence || 0,
        reimbursementAmount: response.data.reimbursementAmount,
        createdBy: req.user.id,
        modelVersion: response.data.modelVersion || 'unknown',
        createdAt: new Date(),
      });

      return res.json({
        message: 'Reimbursement estimated successfully',
        estimation,
        totalAmountPaid: medicalBulletin.financialInfo.totalAmountPaid,
        plan: client.plan,
      });
    } catch (axiosError) {
      console.error('ML backend error:', {
        message: axiosError.message,
        response: axiosError.response?.data,
      });
      return res.status(axiosError.response?.status || 500).json({
        message: `ML backend failed: ${axiosError.response?.data?.detail || 'Unknown error'}`,
      });
    }
  } catch (error) {
    console.error('Estimation error:', {
      message: error.message,
      stack: error.stack,
      clientId: req.body.clientId,
      medicalBulletinId: req.body.medicalBulletinId,
    });
    return res.status(500).json({ message: 'Server error during reimbursement estimation' });
  }
};
export const getEstimations = async (req, res) => {
  try {
    const { clientId } = req.params;

    // Validate clientId
    if (!clientId || !mongoose.isValidObjectId(clientId)) {
      return res.status(400).json({ message: 'Invalid Client ID' });
    }

    // Find the insurer based on the logged-in user's ID
    const insurer = await Insurer.findOne({ userId: req.user.id }).lean();
    if (!insurer) {
      return res.status(404).json({ message: 'Insurer not found' });
    }
    if (!insurer.verified) {
      return res.status(403).json({ message: 'Insurer account not verified' });
    }

    // Verify the client is associated with the insurer
    const client = await Client.findById(clientId).lean();
    if (
      !client ||
      !insurer.clients.some((c) => c.clientId && c.clientId.equals(client._id))
    ) {
      return res.status(404).json({
        message: 'Client not found or not associated with this insurer',
      });
    }

    // Fetch all estimations for the client
    const estimations = await Estimation.find({ clientId: client.userId }).lean();

    return res.json({
      message: 'Estimations retrieved successfully',
      estimations,
      totalAmountPaid: estimations.length > 0 ? estimations[0].medicalBulletinId?.financialInfo?.totalAmountPaid : null,
      plan: client.plan,
    });
  } catch (error) {
    console.error('Error fetching estimations:', {
      message: error.message,
      stack: error.stack,
      clientId: req.params.clientId,
    });
    return res.status(500).json({ message: 'Server error while fetching estimations' });
  }
};
export const getEstimationByBulletin = async (req, res) => {
  try {
    const { medicalBulletinId } = req.params;

    // Validate medicalBulletinId
    if (!medicalBulletinId || !mongoose.isValidObjectId(medicalBulletinId)) {
      return res.status(400).json({ message: 'Invalid Medical Bulletin ID' });
    }

    // Find the insurer based on the logged-in user's ID
    const insurer = await Insurer.findOne({ userId: req.user.id }).lean();
    if (!insurer) {
      return res.status(404).json({ message: 'Insurer not found' });
    }
    if (!insurer.verified) {
      return res.status(403).json({ message: 'Insurer account not verified' });
    }

    // Find the medical bulletin
    const medicalBulletin = await MedicalBulletin.findById(medicalBulletinId).lean();
    if (!medicalBulletin) {
      return res.status(404).json({ message: 'Medical bulletin not found' });
    }

    // Validate clientId in medical bulletin
    if (!mongoose.isValidObjectId(medicalBulletin.clientId)) {
      return res.status(400).json({ message: 'Invalid client ID in medical bulletin' });
    }

    // Find the client associated with the bulletin
    const client = await Client.findById(medicalBulletin.clientId).lean();
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Verify client is associated with the insurer
    const isClientAssociated = insurer.clients.some((c) =>
      c.clientId && c.clientId.equals(client._id)
    );
    if (!isClientAssociated) {
      return res.status(404).json({
        message: 'Client not associated with this insurer',
      });
    }

    // Find the estimation for the medical bulletin
    const estimation = await Estimation.findOne({ medicalBulletinId }).lean();

    return res.json({
      message: estimation
        ? 'Estimation retrieved successfully'
        : 'No estimation found for this medical bulletin',
      estimation,
      totalAmountPaid: medicalBulletin.financialInfo.totalAmountPaid,
      plan: client.plan,
    });
  } catch (error) {
    console.error('Error fetching estimation by bulletin:', {
      message: error.message,
      stack: error.stack,
      medicalBulletinId: req.params.medicalBulletinId,
      userId: req.user.id,
    });
    return res.status(500).json({ message: 'Server error while fetching estimation' });
  }
};