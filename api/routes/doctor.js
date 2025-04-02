import express from 'express';
import { auth } from '../middleware/auth.js';
import { 
  signupDoctor, 
  loginDoctor, 
  createMedicalBulletin 
} from '../controllers/doctorController.js';

const router = express.Router();

router.post('/signup', signupDoctor);
router.post('/login', loginDoctor);
router.post('/medical-bulletin', auth, createMedicalBulletin);

export default router;