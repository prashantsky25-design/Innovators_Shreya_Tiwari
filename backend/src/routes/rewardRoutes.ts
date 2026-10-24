import { Router } from 'express';
import { getRewardsDashboard, getLeaderboard } from '../controllers/rewardController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/dashboard', authenticate, getRewardsDashboard);
router.get('/leaderboard', getLeaderboard);

export default router;
