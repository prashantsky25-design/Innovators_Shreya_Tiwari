import { Router } from 'express';
import {
  getEvents,
  getEventBySlugOrId,
  createEvent,
  updateEvent,
  getOrganizerEvents,
  getDomains,
} from '../controllers/eventController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', getEvents);
router.get('/domains', getDomains);
router.get('/organizer/my-events', authenticate, authorize('organizer', 'admin'), getOrganizerEvents);
router.get('/:identifier', getEventBySlugOrId);
router.post('/', authenticate, authorize('organizer', 'admin'), createEvent);
router.put('/:id', authenticate, authorize('organizer', 'admin'), updateEvent);

export default router;
