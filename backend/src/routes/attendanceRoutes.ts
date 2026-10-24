import { Router } from 'express';
import {
  scanAndVerifyTicket,
  getAttendanceHistory,
  getLiveAttendanceForEvent,
} from '../controllers/attendanceController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.post('/scan', authenticate, authorize('organizer', 'admin'), scanAndVerifyTicket);
router.get('/my-history', authenticate, getAttendanceHistory);
router.get('/event/:eventId/live', authenticate, authorize('organizer', 'admin'), getLiveAttendanceForEvent);

export default router;
