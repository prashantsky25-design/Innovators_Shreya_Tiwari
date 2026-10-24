import { Response } from 'express';
import { User } from '../models/User.js';
import { CoinTransaction } from '../models/CoinTransaction.js';
import { Achievement } from '../models/Achievement.js';
import { AuthRequest } from '../middleware/auth.js';

export const getRewardsDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Coin transactions ledger
    const transactions = await CoinTransaction.find({ userId })
      .populate('eventId', 'title slug')
      .sort({ timestamp: -1 })
      .limit(50);

    // Milestones definition & user unlock status
    const allAchievements = await Achievement.find().sort({ threshold: 1 });

    const achievementsProgress = allAchievements.map((ach) => {
      let isUnlocked = user.badges.includes(ach.code);
      let currentMetric = 0;
      if (ach.category === 'attendance') {
        currentMetric = user.eventsAttendedCount;
      } else if (ach.category === 'coins') {
        currentMetric = user.totalCoinsEarned;
      }

      const progressPercent = Math.min(100, Math.round((currentMetric / ach.threshold) * 100));

      return {
        ...ach.toObject(),
        isUnlocked,
        currentMetric,
        progressPercent,
      };
    });

    // Milestone toward 100 coins
    const centurionProgress = Math.min(100, Math.round((user.totalCoinsEarned / 100) * 100));

    // Calculate level based on total coins
    let level = 'Novice Explorer';
    let levelBadge = '🌱';
    if (user.totalCoinsEarned >= 100) {
      level = 'Sphere Legend';
      levelBadge = '👑';
    } else if (user.totalCoinsEarned >= 50) {
      level = 'Master Pioneer';
      levelBadge = '🌟';
    } else if (user.totalCoinsEarned >= 20) {
      level = 'Active Enthusiast';
      levelBadge = '⚡';
    }

    res.json({
      success: true,
      balance: user.eventCoinsBalance,
      totalEarned: user.totalCoinsEarned,
      eventsAttended: user.eventsAttendedCount,
      level,
      levelBadge,
      centurionProgress,
      badges: user.badges,
      achievements: achievementsProgress,
      transactions,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getLeaderboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Only users who have opted into the leaderboard are shown
    const leaders = await User.find({
      isLeaderboardOptedIn: true,
      role: 'participant',
      totalCoinsEarned: { $gt: 0 },
    })
      .select('name avatarUrl organization totalCoinsEarned eventsAttendedCount badges')
      .sort({ totalCoinsEarned: -1, eventsAttendedCount: -1 })
      .limit(25);

    const ranked = leaders.map((leader, index) => ({
      rank: index + 1,
      id: leader._id,
      name: leader.name,
      avatarUrl: leader.avatarUrl,
      organization: leader.organization,
      totalCoins: leader.totalCoinsEarned,
      eventsAttended: leader.eventsAttendedCount,
      badgesCount: leader.badges.length,
      isCurrentUser: req.user ? String(leader._id) === String(req.user._id) : false,
    }));

    res.json({ success: true, leaderboard: ranked });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
