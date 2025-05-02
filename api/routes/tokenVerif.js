import express from 'express';
import VerificationToken from '../models/TokenVerif.js';
import Doctor from '../models/Doctor.js';
import Insurer from '../models/Insurer.js';
import { validateVerificationToken } from '../controllers/tokenController.js';

const router = express.Router();

// Verification endpoint
router.get('/verify', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.redirect(`${process.env.FRONTEND_URL}/verification?status=error&message=Verification token is required`);
    }

    // Validate token
    const verificationToken = await validateVerificationToken(token);
    if (!verificationToken) {
      return res.redirect(`${process.env.FRONTEND_URL}/verification?status=error&message=Invalid or expired verification token`);
    }

    // Update the corresponding entity based on role
    let entity;
    if (verificationToken.role === 'doctor') {
      entity = await Doctor.findOne({ userId: verificationToken.userId });
    } else if (verificationToken.role === 'insurer') {
      entity = await Insurer.findOne({ userId: verificationToken.userId });
    }

    if (!entity) {
      return res.redirect(`${process.env.FRONTEND_URL}/verification?status=error&message=Entity not found`);
    }

    if (entity.verified) {
      return res.redirect(`${process.env.FRONTEND_URL}/verification?status=error&message=User is already verified`);
    }

    // Verify the user
    entity.verified = true;
    await entity.save();

    // Delete the verification token
    await VerificationToken.deleteOne({ _id: verificationToken._id });

    // Redirect to frontend verification page with success status
    res.redirect(`${process.env.FRONTEND_URL}/verification?status=success`);
  } catch (error) {
    console.error('Verification error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/verification?status=error&message=Server error during verification`);
  }
});

export default router;