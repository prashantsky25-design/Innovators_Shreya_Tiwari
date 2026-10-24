import { Router } from 'express';
import {
  getMyCertificates,
  verifyCertificate,
  saveCertificateTemplate,
  getTemplates,
} from '../controllers/certificateController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/my-certificates', authenticate, getMyCertificates);
router.get('/verify/:certificateId', verifyCertificate);
router.post('/templates', authenticate, authorize('organizer', 'admin'), saveCertificateTemplate);
router.get('/templates', authenticate, authorize('organizer', 'admin'), getTemplates);

export default router;
