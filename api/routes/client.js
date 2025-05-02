import express from 'express';
import { loginClient, getMedicalBulletins, getInsuranceDetails, getMedicalBulletinDetails } from '../controllers/client.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', loginClient);
router.get('/medical-bulletins', auth, getMedicalBulletins);
router.get('/insurance-details', auth, getInsuranceDetails);
router.get('/bulletins/:bulletinId', auth, getMedicalBulletinDetails);

export default router;