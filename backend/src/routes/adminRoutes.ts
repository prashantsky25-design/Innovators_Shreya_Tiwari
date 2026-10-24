import { Router } from 'express';
import {
  getAdminMetrics,
  getAdminUsers,
  updateUserRole,
  moderateEvent,
  createDomain,
  getAuditLogs,
  getEmailLogs,
} from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/metrics', getAdminMetrics);
router.get('/users', getAdminUsers);
router.put('/users/:id/role', updateUserRole);
router.put('/events/:id/moderate', moderateEvent);
router.post('/domains', createDomain);
router.get('/audit-logs', getAuditLogs);
router.get('/email-logs', getEmailLogs);

export default router;
