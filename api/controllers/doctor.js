import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Doctor from "../models/Doctor.js";
import MedicalBulletin from "../models/MedicalBulletin.js";
import Client from "../models/Client.js";

export const createMedicalBulletin = async (req, res) => {
  try {
    console.log("Incoming Request Body:", req.body);

    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor profile not found." });
    }

    const { clientEmail, treatmentDetails, financialInfo } = req.body;

    if (!clientEmail || !treatmentDetails || !financialInfo) {
      return res
        .status(400)
        .json({
          message:
            "Missing required fields: clientEmail, treatmentDetails, or financialInfo.",
        });
    }

    const requiredTreatmentFields = [
      "diagnosis",
      "sessionsAttended",
      "treatmentDuration",
      "treatmentType",
      "caseSeverity",
    ];
    for (const field of requiredTreatmentFields) {
      if (
        treatmentDetails[field] === undefined ||
        treatmentDetails[field] === null
      ) {
        return res
          .status(400)
          .json({ message: `Missing treatment detail: ${field}.` });
      }
    }

    if (
      financialInfo.totalAmountPaid === undefined ||
      financialInfo.totalAmountPaid === null
    ) {
      return res
        .status(400)
        .json({ message: "Missing financial detail: totalAmountPaid." });
    }

    const caseSeverity = Number(treatmentDetails.caseSeverity);
    if (isNaN(caseSeverity) || caseSeverity < 0 || caseSeverity > 5) {
      return res
        .status(400)
        .json({ message: "caseSeverity must be a number between 0 and 5." });
    }

    treatmentDetails.sessionsAttended = Number(
      treatmentDetails.sessionsAttended
    );
    treatmentDetails.caseSeverity = caseSeverity;
    financialInfo.totalAmountPaid = Number(financialInfo.totalAmountPaid);

    if (
      isNaN(treatmentDetails.sessionsAttended) ||
      isNaN(financialInfo.totalAmountPaid)
    ) {
      return res
        .status(400)
        .json({
          message:
            "Invalid numeric values provided in treatmentDetails or financialInfo.",
        });
    }

    const clientUser = await User.findOne({
      email: clientEmail,
      role: "client",
    });
    if (!clientUser) {
      return res
        .status(404)
        .json({ message: "Client not found with the provided email." });
    }

    const client = await Client.findOne({ userId: clientUser._id });
    if (!client) {
      return res.status(404).json({ message: "Client profile not found." });
    }

    const bulletin = await MedicalBulletin.create({
      doctorId: doctor._id,
      clientId: client._id,
      treatmentDetails,
      financialInfo,
    });

    client.medicalDocs.push(bulletin._id);
    await client.save();

    const populatedBulletin = await MedicalBulletin.findById(bulletin._id)
      .populate("doctorId", "fullName specialty")
      .populate("clientId", "name birthDate");

    res.status(201).json({
      message: "Medical bulletin created successfully.",
      bulletin: populatedBulletin,
    });
  } catch (error) {
    console.error("Error creating medical bulletin:", error);
    res.status(500).json({ message: "Error creating medical bulletin." });
  }
};
export const getMedicalBulletinsByDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor profile not found." });
    }

    const search = req.query.search ? req.query.search.toString().trim() : "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { doctorId: doctor._id };

    if (search) {
      const users = await User.find({
        email: { $regex: search, $options: "i" },
        role: "client",
      }).select("_id");
      const userIds = users.map((user) => user._id);

      const clients = await Client.find({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { userId: { $in: userIds } },
        ],
      }).select("_id");
      const clientIds = clients.map((client) => client._id);

      query.clientId = clientIds.length > 0 ? { $in: clientIds } : { $in: [] };
    }

    const bulletins = await MedicalBulletin.find(query)
      .populate({
        path: "clientId",
        select: "name birthDate",
        populate: { path: "userId", model: User, select: "email" },
      })
      .populate({ path: "doctorId", select: "fullName specialty" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await MedicalBulletin.countDocuments(query);

    res.status(200).json({
      message: "Medical bulletin history retrieved successfully.",
      bulletins,
      total,
      page,
      limit,
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving medical bulletins." });
  }
};
export const getDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.id }).populate(
      "userId",
      "email phoneNumber image"
    );
    if (!doctor) {
      return res.status(404).json({ message: "Doctor profile not found." });
    }

    res.status(200).json({
      message: "Doctor profile retrieved successfully.",
      doctor: {
        fullName: doctor.fullName,
        specialty: doctor.specialty,
        email: doctor.userId.email,
        phoneNumber: doctor.userId.phoneNumber,
        image: doctor.userId.image,
      },
    });
  } catch (error) {
    console.error("Error retrieving doctor profile:", error);
    res.status(500).json({ message: "Error retrieving doctor profile." });
  }
};
export const updateDoctorProfile = async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;

    if (!phoneNumber && !password) {
      return res
        .status(400)
        .json({
          message:
            "At least one field (phoneNumber or password) must be provided.",
        });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (phoneNumber) {
      const existingUser = await User.findOne({
        phoneNumber,
        _id: { $ne: user._id },
      });
      if (existingUser) {
        return res
          .status(400)
          .json({ message: "Phone number already in use." });
      }
      user.phoneNumber = phoneNumber;
    }

    if (password) {
      user.password = password; // bcrypt hashing handled by userSchema.pre('save')
    }

    await user.save();

    res.status(200).json({ message: "Profile updated successfully." });
  } catch (error) {
    console.error("Error updating doctor profile:", error);
    res.status(500).json({ message: "Error updating doctor profile." });
  }
};
