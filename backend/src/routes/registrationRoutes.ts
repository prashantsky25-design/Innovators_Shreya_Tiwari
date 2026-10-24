import { Router } from 'express';
import {
  registerForEvent,
  getMyRegistrations,
  getEventRegistrations,
} from '../controllers/registrationController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticate, registerForEvent);
router.get('/my-registrations', authenticate, getMyRegistrations);
router.get('/event/:eventId', authenticate, authorize('organizer', 'admin'), getEventRegistrations);

export default router;
