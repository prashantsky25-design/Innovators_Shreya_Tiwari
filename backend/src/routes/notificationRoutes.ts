import { Router } from 'express';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../controllers/notificationController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, getNotifications);
router.put('/:id/read', authenticate, markNotificationAsRead);
router.put('/read-all', authenticate, markAllNotificationsAsRead);

export default router;
