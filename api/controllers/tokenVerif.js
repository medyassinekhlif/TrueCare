import crypto from 'crypto';
import VerificationToken from '../models/TokenVerif.js';

export const generateVerificationToken = async (userId, role) => {
  try {
    await VerificationToken.deleteOne({ userId });

    const token = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    await VerificationToken.create({
      userId,
      role,
      token,
      expires,
    });

    return token;
  } catch (error) {
    throw new Error('Error generating verification token');
  }
};

export const validateVerificationToken = async (token) => {
  try {
    const verificationToken = await VerificationToken.findOne({
      token,
      expires: { $gt: Date.now() },
    });

    if (!verificationToken) {
      return null;
    }

    return verificationToken;
  } catch (error) {
    throw new Error('Error validating verification token');
  }
};