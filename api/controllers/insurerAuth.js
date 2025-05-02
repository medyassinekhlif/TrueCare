import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Insurer from "../models/Insurer.js";
import cloudinary from "../config/cloudinary.js";
import upload from "../middleware/multer.js";

const uploadInsurerFiles = upload.fields([
  { name: "businessRegistration", maxCount: 1 },
  { name: "insuranceLicense", maxCount: 1 },
  { name: "photoId", maxCount: 1 },
  { name: "authorizationLetter", maxCount: 1 },
  { name: "image", maxCount: 1 },
]);

export const signupInsurer = async (req, res) => {
  uploadInsurerFiles(req, res, async (err) => {
    if (err) {
      console.error("Multer error:", err.message);
      return res.status(400).json({ message: err.message });
    }
    try {
      const {
        email,
        password,
        companyName,
        taxId,
        address,
        website,
        phoneNumber,
        plans,
      } = req.body;

      if (
        !email ||
        !password ||
        !companyName ||
        !taxId ||
        !address ||
        !phoneNumber ||
        !req.files?.businessRegistration ||
        !req.files?.insuranceLicense ||
        !req.files?.photoId ||
        !req.files?.authorizationLetter ||
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
      let parsedPlans = plans;
      if (typeof plans === "string") {
        try {
          parsedPlans = JSON.parse(plans);
        } catch (error) {
          return res.status(400).json({ message: "Invalid plans format" });
        }
      }
      const defaultPlans = [
        { range: { min: 50, max: 70 }, maxCoverage: 50000 },
        { range: { min: 70, max: 85 }, maxCoverage: 100000 },
        { range: { min: 85, max: 95 }, maxCoverage: 200000 },
      ];
      parsedPlans =
        parsedPlans && Array.isArray(parsedPlans) ? parsedPlans : defaultPlans;

      for (const plan of parsedPlans) {
        if (
          !plan.range ||
          plan.range.min > plan.range.max ||
          plan.range.min < 0 ||
          plan.range.max > 100
        ) {
          return res.status(400).json({ message: "Invalid plan range" });
        }
        if (!plan.maxCoverage || plan.maxCoverage < 0) {
          return res.status(400).json({ message: "Invalid max coverage" });
        }
      }

      const uploadFile = async (file) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: "auto", folder: "insurer_documents" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result.secure_url);
            }
          );
          stream.end(file.buffer);
        });
      };

      const businessRegistration = await uploadFile(
        req.files.businessRegistration[0]
      );
      const insuranceLicense = await uploadFile(req.files.insuranceLicense[0]);
      const photoId = await uploadFile(req.files.photoId[0]);
      const authorizationLetter = await uploadFile(
        req.files.authorizationLetter[0]
      );
      const image = await uploadFile(req.files.image[0]);

      const user = await User.create({
        email,
        password,
        role: "insurer",
        phoneNumber,
        image,
      });

      const insurer = await Insurer.create({
        userId: user._id,
        companyName,
        businessRegistration,
        insuranceLicense,
        taxId,
        address,
        website,
        authorizedRepresentative: { photoId, authorizationLetter },
        plans: parsedPlans,
        verified: false,
      });

      res
        .status(201)
        .json({
          message:
            "Insurer account created successfully. Awaiting verification.",
        });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Server error during signup" });
    }
  });
};
export const loginInsurer = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email, role: "insurer" });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or role" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const insurer = await Insurer.findOne({ userId: user._id });
    if (!insurer) {
      return res.status(404).json({ message: "Insurer profile not found" });
    }
    if (!insurer.verified) {
      return res
        .status(403)
        .json({
          message: "Account not verified. Please contact the administrator.",
        });
    }

    const token = jwt.sign({ id: user._id, role: "insurer" }, process.env.JWT, {
      expiresIn: "1d",
    });
    res.json({ token, message: "Login successful" });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};
