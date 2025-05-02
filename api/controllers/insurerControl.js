import User from "../models/User.js";
import Insurer from "../models/Insurer.js";
import Client from "../models/Client.js";
import cloudinary from "../config/cloudinary.js";
import upload from "../middleware/multer.js";
import mongoose from "mongoose";
import MedicalBulletin from '../models/MedicalBulletin.js'


const uploadClientFiles = upload.fields([{ name: "image", maxCount: 1 }]);


export const addClient = async (req, res) => {
  uploadClientFiles(req, res, async (err) => {
    if (err) {
      console.error("Multer error:", err.message, err.stack);
      return res.status(400).json({ message: `Multer error: ${err.message}` });
    }
    try {
      const {
        email,
        password,
        name,
        birthDate,
        nationalId,
        job,
        phoneNumber,
        health,
        plan,
      } = req.body;

      if (
        !email ||
        !password ||
        !name ||
        !birthDate ||
        !nationalId ||
        !job ||
        !phoneNumber ||
        !health ||
        !plan
      ) {
        return res.status(400).json({ message: "All fields are required" });
      }

      if (!/^\d{8}$/.test(nationalId)) {
        return res
          .status(400)
          .json({ message: "National ID must be exactly 8 digits" });
      }
      if (!/^\d{8}$/.test(phoneNumber)) {
        return res
          .status(400)
          .json({ message: "Phone number must be exactly 8 digits" });
      }

      if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)) {
        return res.status(400).json({
          message: 'Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        });
      }

      if (!req.files || Object.keys(req.files).length === 0 || !req.files.image || !req.files.image[0]) {
        return res.status(400).json({
          message: "Image file is required. Ensure a valid JPEG or PNG file is uploaded with field name 'image'.",
          debug: {
            files: req.files,
            headers: req.headers["content-type"],
          },
        });
      }
      const imageFile = req.files.image[0];
      if (!["image/jpeg", "image/png"].includes(imageFile.mimetype)) {
        return res.status(400).json({ message: "Image must be JPEG or PNG" });
      }
      if (imageFile.size > 5 * 1024 * 1024) {
        return res.status(400).json({ message: "Image size must be less than 5MB" });
      }

      const parsedDate = new Date(birthDate);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ message: "Invalid date of birth" });
      }

      const existingUser = await User.findOne({
        $or: [{ email }, { phoneNumber }],
      });
      if (existingUser) {
        return res
          .status(409)
          .json({ message: "Email or phone number already exists" });
      }

      const existingClient = await Client.findOne({ nationalId });
      if (existingClient) {
        return res.status(409).json({ message: "National ID already exists" });
      }

      const insurer = await Insurer.findOne({ userId: req.user.id });
      if (!insurer) {
        return res.status(404).json({ message: "Insurer not found" });
      }
      if (!insurer.verified) {
        return res.status(403).json({ message: "Insurer account not verified" });
      }

      let parsedPlan = plan;
      if (typeof plan === "string") {
        try {
          parsedPlan = JSON.parse(plan);
        } catch (error) {
          return res.status(400).json({ message: "Invalid plan format" });
        }
      }
      if (
        !parsedPlan.range ||
        parsedPlan.range.min > parsedPlan.range.max ||
        parsedPlan.range.min < 0 ||
        parsedPlan.range.max > 100
      ) {
        return res.status(400).json({ message: "Invalid plan range" });
      }

      let parsedHealth = health;
      if (typeof health === "string") {
        try {
          parsedHealth = JSON.parse(health);
        } catch (error) {
          return res.status(400).json({ message: "Invalid health format" });
        }
      }

      const uploadFile = async (file) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              resource_type: "image",
              folder: "client_images",
              timeout: 60000,
            },
            (error, result) => {
              if (error) {
                reject(new Error("Failed to upload image to Cloudinary"));
              } else {
                resolve(result.secure_url);
              }
            }
          );
          stream.on("error", (error) => reject(error));
          stream.end(file.buffer);
        });
      };
      const imageUrl = await uploadFile(imageFile);

      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        const clientUser = await User.create(
          [
            {
              email,
              password,
              role: "client",
              phoneNumber,
              image: imageUrl,
            },
          ],
          { session }
        );

        const client = await Client.create(
          [
            {
              userId: clientUser[0]._id,
              name,
              birthDate: parsedDate,
              nationalId,
              job,
              health: parsedHealth,
              insurer: insurer._id,
              plan: parsedPlan,
            },
          ],
          { session }
        );

        insurer.clients.push({ clientId: client[0]._id });
        await insurer.save({ session });

        await session.commitTransaction();
        res.status(201).json({
          message: "Client added successfully",
          clientId: client[0]._id,
        });
      } catch (error) {
        await session.abortTransaction();
        try {
          const publicId = imageUrl.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(publicId);
        } catch (cloudinaryError) {
          console.error("Failed to delete Cloudinary image:", cloudinaryError);
        }
        throw error;
      } finally {
        session.endSession();
      }
    } catch (error) {
      if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        return res
          .status(409)
          .json({ message: `Duplicate key error: ${field} already exists` });
      }
      res.status(400).json({ message: error.message || "Failed to add client" });
    }
  });
};
export const updateClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.clientId);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    const insurer = await Insurer.findOne({ userId: req.user.id });
    if (
      !insurer ||
      !insurer.clients.some((c) => c.clientId && c.clientId.equals(client._id))
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this client" });
    }

    if (req.body.plan) {
      const parsedPlan =
        typeof req.body.plan === "string"
          ? JSON.parse(req.body.plan)
          : req.body.plan;
      if (
        !parsedPlan.range ||
        parsedPlan.range.min > parsedPlan.range.max ||
        parsedPlan.range.min < 0 ||
        parsedPlan.range.max > 100
      ) {
        return res.status(400).json({ message: "Invalid plan range" });
      }
      req.body.plan = parsedPlan;
    }

    Object.assign(client, req.body);
    await client.save();

    res.json({
      message: "Client updated successfully",
      client,
    });
  } catch (error) {
    console.error("Update client error:", error);
    res.status(400).json({ message: error.message });
  }
};
export const getDashboard = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No user ID found" });
    }

    const { search = "", page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const insurer = await Insurer.findOne({ userId: req.user.id }).populate([
      {
        path: "clients.clientId",
        select: "name birthDate nationalId job plan health",
        populate: { path: "userId", select: "email image" },
      },
      { path: "userId", select: "email phoneNumber image" },
    ]);

    if (!insurer) {
      return res.status(404).json({ message: "Insurer not found" });
    }
    if (!insurer.verified) {
      return res.status(403).json({ message: "Insurer account not verified" });
    }

    let clients = insurer.clients.filter(({ clientId }) => clientId != null);

    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      clients = clients.filter(
        ({ clientId }) =>
          searchRegex.test(clientId.name) ||
          searchRegex.test(clientId.userId?.email)
      );
    }

    const total = clients.length;
    clients = clients.slice(skip, skip + parseInt(limit));

    const formattedClients = clients.map(({ clientId }) => ({
      _id: clientId._id,
      clientId: clientId._id,
      name: clientId.name ?? "Unknown",
      birthDate: clientId.birthDate ?? null,
      nationalId: clientId.nationalId ?? "N/A",
      job: clientId.job ?? "Unknown",
      plan: clientId.plan ?? { range: { min: 0, max: 0 } },
      health: clientId.health ?? {
        conditions: "",
        smoker: false,
        exercise: "Sometimes",
      },
      email: clientId.userId?.email ?? "N/A",
      image: clientId.userId?.image ?? "",
    }));

    res.json({
      companyName: insurer.companyName,
      email: insurer.userId?.email ?? "N/A",
      phoneNumber: insurer.userId?.phoneNumber ?? "N/A",
      address: insurer.address ?? "N/A",
      website: insurer.website ?? "N/A",
      plans: insurer.plans ?? [],
      clients: formattedClients,
      profilePicture: insurer.userId?.image ?? "",
      total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
export const updateDashboard = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized: No user ID found" });
    }

    const {
      companyName,
      email,
      phoneNumber,
      address,
      website,
      plans,
    } = req.body;

    // Update User document
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    await user.save();

    // Update Insurer document
    const insurer = await Insurer.findOne({ userId: req.user.id });
    if (!insurer) {
      return res.status(404).json({ message: "Insurer not found" });
    }
    if (companyName) insurer.companyName = companyName;
    if (address) insurer.address = address;
    if (website) insurer.website = website;
    if (plans) insurer.plans = plans;
    await insurer.save();

    // Fetch updated data for response
    const updatedInsurer = await Insurer.findOne({ userId: req.user.id })
      .populate('userId', 'email phoneNumber image');

    res.json({
      companyName: updatedInsurer.companyName,
      email: updatedInsurer.userId.email,
      phoneNumber: updatedInsurer.userId.phoneNumber,
      address: updatedInsurer.address,
      website: updatedInsurer.website,
      plans: updatedInsurer.plans,
      profilePicture: updatedInsurer.userId?.image ?? "",
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
export const getClient = async (req, res) => {
  try {
    const insurer = await Insurer.findOne({ userId: req.user.id });
    if (!insurer) {
      return res.status(404).json({ message: "Insurer not found" });
    }
    if (!insurer.verified) {
      return res.status(403).json({ message: "Insurer account not verified" });
    }
    const client = await Client.findById(req.params.clientId).populate(
      "userId insurer"
    );
    if (
      !client ||
      !insurer.clients.some((c) => c.clientId && c.clientId.equals(client._id))
    ) {
      return res.status(404).json({ message: "Client not found" });
    }
    const medicalDocs = await MedicalBulletin.find({ clientId: client._id }); 
    res.json({
      client: {
        name: client.name,
        birthDate: client.birthDate,
        clientId: client._id,
        email: client.userId.email,
        assuranceCompany: client.insurer.companyName,
        plan: client.plan,
        nationalId: client.nationalId,
        job: client.job,
        health: client.health,
      },
      medicalDocs,
    });
  } catch (error) {
    console.error("Get client error:", error);
    res.status(400).json({ message: error.message });
  }
};
export const getMedicalBulletin = async (req, res) => {
  try {
    const insurer = await Insurer.findOne({ userId: req.user.id });
    if (!insurer) {
      return res.status(404).json({ message: "Insurer not found" });
    }
    if (!insurer.verified) {
      return res.status(403).json({ message: "Insurer account not verified" });
    }
    const medicalBulletin = await MedicalBulletin.findById(
      req.params.medicalBulletinId
    ).populate("clientId doctorId");
    if (!medicalBulletin) {
      return res.status(404).json({ message: "Medical bulletin not found" });
    }
    const client = await Client.findById(medicalBulletin.clientId);
    if (
      !client ||
      !insurer.clients.some((c) => c.clientId && c.clientId.equals(client._id))
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this medical bulletin" });
    }
    res.json({
      _id: medicalBulletin._id,
      clientId: medicalBulletin.clientId._id,
      clientName: client.name,
      doctorId: medicalBulletin.doctorId._id,
      treatmentDetails: medicalBulletin.treatmentDetails,
      financialInfo: medicalBulletin.financialInfo,
      createdAt: medicalBulletin.createdAt,
    });
  } catch (error) {
    console.error("Get medical bulletin error:", error);
    res.status(400).json({ message: error.message });
  }
};
