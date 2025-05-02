import express from 'express';
import { auth } from '../middleware/auth.js';
import { signupInsurer, loginInsurer } from '../controllers/insurerAuth.js';
import { 
  addClient,
  getClient,
  updateClient,
  getDashboard,
  updateDashboard,
  getMedicalBulletin,
} from '../controllers/insurerControl.js';
import { estimateReimbursement, getEstimations, getEstimationByBulletin } from '../controllers/estimate.js';

const router = express.Router();

router.post('/signup', signupInsurer);
router.post('/login', loginInsurer);
router.post('/clients', auth, addClient);
router.put('/clients/:clientId', auth, updateClient);
router.get('/dashboard', auth, getDashboard);
router.post('/dashboard', auth, updateDashboard);

router.get('/client/:clientId', auth, getClient);
router.post('/estimate', auth, estimateReimbursement);
router.get('/estimations/:clientId', auth, getEstimations);
router.get('/medical-bulletin/:medicalBulletinId', auth, getMedicalBulletin);
router.get('/estimation/bulletin/:medicalBulletinId', auth, getEstimationByBulletin);


// router.get('/clients/:clientId/medical-documents', auth, getClientMedicalDocuments);

export default router;