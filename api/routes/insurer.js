import express from 'express';
import { auth } from '../middleware/auth.js';
import { 
  signupInsurer, 
  loginInsurer, 
  addClient, 
  updateClient,
  getDashboard,
  getClientMedicalDocuments 
} from '../controllers/insurerController.js';

const router = express.Router();

router.post('/signup', signupInsurer);
router.post('/login', loginInsurer);
router.post('/clients', auth, addClient);
router.put('/clients/:clientId', auth, updateClient);
router.get('/dashboard', auth, getDashboard);
router.get('/clients/:clientId/medical-documents', auth, getClientMedicalDocuments);

export default router;