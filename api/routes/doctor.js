import express from 'express';
import { auth } from '../middleware/auth.js';
import { signupDoctor, loginDoctor } from '../controllers/doctorAuth.js';
import { createMedicalBulletin, getMedicalBulletinsByDoctor, getDoctorProfile, updateDoctorProfile } from '../controllers/doctor.js';


const router = express.Router();

router.post('/signup', signupDoctor);
router.post('/login', loginDoctor);
router.post('/medical-bulletin', auth, createMedicalBulletin);
router.get('/medical-bulletins', auth, getMedicalBulletinsByDoctor);
router.get('/profile', auth, getDoctorProfile);
router.put('/profile', auth, updateDoctorProfile);

export default router;