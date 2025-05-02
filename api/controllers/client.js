import MedicalBulletin from '../models/MedicalBulletin.js';
import Doctor from "../models/Doctor.js";
import Client from '../models/Client.js';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Estimation from '../models/Estimation.js';
import mongoose from "mongoose";

export const loginClient = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email, role: 'client' });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or role' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const client = await Client.findOne({ userId: user._id });
    if (!client) {
      return res.status(404).json({ message: 'Client profile not found' });
    }

    const token = jwt.sign({ id: user._id, role: 'client' }, process.env.JWT, { expiresIn: '1d' });
    res.json({ token, message: 'Login successful' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};
export const getMedicalBulletins = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized: No user ID found" });
    }

    const client = await Client.findOne({ userId: req.user.id }).populate([
      { path: "userId", select: "email" },
    ]);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    const { search = "", page = 1, limit = 10, sortField = "createdAt", sortOrder = "desc" } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortField]: sortOrder === "asc" ? 1 : -1 };

    if (!["createdAt", "financialInfo.totalAmountPaid"].includes(sortField)) {
      return res.status(400).json({ message: `Invalid sort field: ${sortField}` });
    }

    const query = { clientId: client._id };
    if (search.trim()) {
      const doctors = await Doctor.find({
        fullName: { $regex: search.trim(), $options: "i" },
      }).select("_id");
      query.doctorId = doctors.length ? { $in: doctors.map((d) => d._id) } : { $in: [] };
    }

    const [bulletins, total] = await Promise.all([
      MedicalBulletin.find(query)
        .populate({
          path: "doctorId",
          select: "fullName specialty",
          populate: { path: "userId", select: "email" },
        })
        .select("doctorId treatmentDetails financialInfo createdAt")
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      MedicalBulletin.countDocuments(query),
    ]);

    const formattedBulletins = bulletins.map((bulletin) => ({
      _id: bulletin._id.toString(),
      doctorName: bulletin.doctorId?.fullName ?? "Unknown Doctor",
      doctorSpecialty: bulletin.doctorId?.specialty ?? "Unknown Specialty",
      clientInfo: {
        name: client.name ?? "N/A",
        birthDate: client.birthDate ?? null,
        nationalId: client.nationalId ?? "N/A",
        job: client.job ?? "N/A",
        health: client.health ?? "N/A",
        assuranceCompany: client.insurer?.companyName ?? "Unknown Insurer",
        plan: client.plan ?? null,
      },
      treatmentDetails: {
        diagnosis: bulletin.treatmentDetails?.diagnosis ?? "N/A",
        sessionsAttended: bulletin.treatmentDetails?.sessionsAttended ?? 0,
        treatmentDuration: bulletin.treatmentDetails?.treatmentDuration ?? "N/A",
        treatmentType: bulletin.treatmentDetails?.treatmentType ?? "N/A",
        caseSeverity: bulletin.treatmentDetails?.caseSeverity?.toString() ?? "N/A",
      },
      financialInfo: {
        totalAmountPaid: bulletin.financialInfo?.totalAmountPaid ?? 0,
        currency: bulletin.financialInfo?.currency ?? "USD",
      },
      createdAt: bulletin.createdAt ?? null,
    }));

    res.json({ bulletins: formattedBulletins, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getInsuranceDetails = async (req, res) => {
  try {
    const client = await Client.findOne({ userId: req.user.id }).populate([
      {
        path: 'insurer',
        select: 'companyName address website',
        populate: {
          path: 'userId',
          model: 'User',
          select: 'email',
        },
      },
      {
        path: 'userId',
        model: 'User',
        select: 'email image',
      },
    ]);

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const insurer = client.insurer;
    if (!insurer) {
      return res.status(404).json({ message: 'Insurance company not found' });
    }

    res.json({
      companyName: insurer.companyName || 'N/A',
      address: insurer.address || 'N/A',
      clientPlan: client.plan || null,
      website: insurer.website || 'N/A',
      email: insurer.userId?.email || 'N/A',
      user: {
        email: client.userId?.email || 'N/A',
        image: client.userId?.image || null,
      },
    });
  } catch (error) {
    console.error('Error fetching insurance details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
export const getMedicalBulletinDetails = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized: No user ID found" });
    }

    const { bulletinId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(bulletinId)) {
      return res.status(400).json({ message: "Invalid bulletin ID" });
    }

    const client = await Client.findOne({ userId: req.user.id }).populate({
      path: "insurer",
      select: "companyName",
      populate: {
        path: "userId",
        model: "User",
        select: "email",
      },
    });
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    const bulletin = await MedicalBulletin.findOne({
      _id: bulletinId,
      clientId: client._id,
    }).populate({
      path: "doctorId",
      select: "fullName specialty",
      populate: { path: "userId", select: "email" },
    });

    if (!bulletin) {
      return res.status(404).json({ message: "Medical bulletin not found" });
    }

    const estimation = await Estimation.findOne({
      medicalBulletinId: bulletinId,
      clientId: req.user.id,
    });

    const formattedBulletin = {
      _id: bulletin._id.toString(),
      doctorName: bulletin.doctorId?.fullName ?? "Unknown Doctor",
      doctorSpecialty: bulletin.doctorId?.specialty ?? "Unknown Specialty",
      doctorEmail: bulletin.doctorId?.userId?.email ?? "N/A",
      treatmentDetails: {
        diagnosis: bulletin.treatmentDetails?.diagnosis ?? "N/A",
        sessionsAttended: bulletin.treatmentDetails?.sessionsAttended ?? 0,
        treatmentDuration: bulletin.treatmentDetails?.treatmentDuration ?? "N/A",
        treatmentType: bulletin.treatmentDetails?.treatmentType ?? "N/A",
        caseSeverity: bulletin.treatmentDetails?.caseSeverity?.toString() ?? "N/A",
      },
      financialInfo: {
        totalAmountPaid: bulletin.financialInfo?.totalAmountPaid ?? 0,
        currency: bulletin.financialInfo?.currency ?? "USD",
      },
      createdAt: bulletin.createdAt ?? null,
      insurer: {
        companyName: client.insurer?.companyName ?? "Unknown Insurer",
        email: client.insurer?.userId?.email ?? "N/A",
      },
      estimation: estimation
        ? {
            _id: estimation._id.toString(),
            reimbursementClass: estimation.reimbursementClass ?? "N/A",
            confidence: estimation.confidence?.toString() ?? "N/A",
            reimbursementAmount: estimation.reimbursementAmount ?? 0,
            modelVersion: estimation.modelVersion ?? "N/A",
            createdAt: estimation.createdAt ?? null,
          }
        : null,
    };

    res.json(formattedBulletin);
  } catch (error) {
    console.error('Error fetching bulletin details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};