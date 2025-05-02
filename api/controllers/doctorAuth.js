import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cloudinary from "../config/cloudinary.js";
import upload from "../middleware/multer.js";
import User from "../models/User.js";
import Doctor from "../models/Doctor.js";

const uploadDoctorFiles = upload.fields([
  { name: "nationalIdOrPassport", maxCount: 1 },
  { name: "medicalLicense", maxCount: 1 },
  { name: "proofOfPractice", maxCount: 1 },
  { name: "taxIdOrBusinessRegistration", maxCount: 1 },
  { name: "image", maxCount: 1 },
]);

export const signupDoctor = async (req, res) => {
  uploadDoctorFiles(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    try {
      const { email, password, name, speciality, npiNumber, phoneNumber } =
        req.body;
      if (
        !email ||
        !password ||
        !name ||
        !speciality ||
        !npiNumber ||
        !phoneNumber ||
        !req.files?.nationalIdOrPassport ||
        !req.files?.medicalLicense ||
        !req.files?.proofOfPractice ||
        !req.files?.taxIdOrBusinessRegistration ||
        !req.files?.image
      ) {
        return res
          .status(400)
          .json({ message: "All fields and files are required" });
      }
      if (!/^\d{8}$/.test(phoneNumber)) {
        return res
          .status(400)
          .json({ message: "Phone number must be exactly 8 digits" });
      }
      if (
        !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
          password
        )
      ) {
        return res.status(400).json({
          message:
            "Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character",
        });
      }
      const existingUser = await User.findOne({
        $or: [{ email }, { phoneNumber }],
      });
      if (existingUser) {
        return res
          .status(409)
          .json({ message: "Email or phone number already in use" });
      }
      const uploadFile = (file) =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: "auto", folder: "doctor_documents" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result.secure_url);
            }
          );
          stream.end(file.buffer);
        });

      const nationalIdOrPassport = await uploadFile(
        req.files.nationalIdOrPassport[0]
      );
      const medicalLicense = await uploadFile(req.files.medicalLicense[0]);
      const proofOfPractice = await uploadFile(req.files.proofOfPractice[0]);
      const taxIdOrBusinessRegistration = await uploadFile(
        req.files.taxIdOrBusinessRegistration[0]
      );
      const image = await uploadFile(req.files.image[0]);

      const user = await User.create({
        email,
        password,
        role: "doctor",
        phoneNumber,
        image,
      });
      const doctor = await Doctor.create({
        userId: user._id,
        fullName: name,
        specialty: speciality,
        npiNumber,
        nationalIdOrPassport,
        medicalLicense,
        proofOfPractice,
        taxIdOrBusinessRegistration,
        verified: false,
      });
      res.status(201).json({ message: "Doctor account created successfully" });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Server error during signup" });
    }
  });
};
export const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    const user = await User.findOne({ email, role: "doctor" });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or role" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }
    const doctor = await Doctor.findOne({ userId: user._id });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }
    if (!doctor.verified) {
      return res
        .status(403)
        .json({
          message:
            "Your account is not verified yet. We are currently processing your account verification. Please try again later.",
        });
    }
    const token = jwt.sign({ id: user._id, role: "doctor" }, process.env.JWT, {
      expiresIn: "1d",
    });
    res.json({ token, message: "Login successful" });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};
