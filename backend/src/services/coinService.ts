import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { CoinTransaction } from '../models/CoinTransaction.js';
import { Notification } from '../models/Notification.js';

export interface AttendanceRewardResult {
  coinsAwarded: number;
  newBalance: number;
  newAttendedCount: number;
  unlockedBadges: string[];
}

export const processVerifiedAttendanceReward = async (
  userId: string | mongoose.Types.ObjectId,
  eventId: string | mongoose.Types.ObjectId,
  attendanceId: string | mongoose.Types.ObjectId
): Promise<AttendanceRewardResult> => {
  const idempotencyKey = `attendance_reward_${attendanceId}`;

  // 1. Check if coins for this attendance were already awarded (Idempotency)
  const existingTx = await CoinTransaction.findOne({ idempotencyKey });
  if (existingTx) {
    console.log(`[CoinService] Duplicate reward prevention: ${idempotencyKey} already processed.`);
    const currentUser = await User.findById(userId);
    return {
      coinsAwarded: 0,
      newBalance: currentUser?.eventCoinsBalance || 0,
      newAttendedCount: currentUser?.eventsAttendedCount || 0,
      unlockedBadges: [],
    };
  }

  const COIN_REWARD = 10;
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found for coin reward');
  }

  const updatedBalance = user.eventCoinsBalance + COIN_REWARD;
  const updatedTotal = user.totalCoinsEarned + COIN_REWARD;
  const updatedAttendedCount = user.eventsAttendedCount + 1;

  const unlockedBadges: string[] = [];

  // Gamification milestone rules
  if (updatedAttendedCount >= 1 && !user.badges.includes('FIRST_STEP')) {
    unlockedBadges.push('FIRST_STEP');
  }
  if (updatedAttendedCount >= 5 && !user.badges.includes('EXPLORER_5')) {
    unlockedBadges.push('EXPLORER_5');
  }
  if (updatedAttendedCount >= 10 && !user.badges.includes('CHAMPION_10')) {
    unlockedBadges.push('CHAMPION_10');
  }
  if (updatedTotal >= 100 && !user.badges.includes('CENTURION_100')) {
    unlockedBadges.push('CENTURION_100');
  }

  // Atomic update of user document
  user.eventCoinsBalance = updatedBalance;
  user.totalCoinsEarned = updatedTotal;
  user.eventsAttendedCount = updatedAttendedCount;
  if (unlockedBadges.length > 0) {
    user.badges.push(...unlockedBadges);
  }
  await user.save();

  // Create immutable ledger transaction
  await CoinTransaction.create({
    userId: user._id,
    eventId,
    amount: COIN_REWARD,
    balanceAfter: updatedBalance,
    type: 'attendance_reward',
    reason: 'Verified Event Attendance Reward',
    idempotencyKey,
    timestamp: new Date(),
  });

  // Create in-app notification
  await Notification.create({
    userId: user._id,
    title: '🎉 +10 EventCoins Earned!',
    message: `You earned 10 EventCoins for attending the event. New balance: ${updatedBalance} coins.`,
    type: 'coins',
    link: '/participant/rewards',
  });

  for (const badge of unlockedBadges) {
    await Notification.create({
      userId: user._id,
      title: '🏆 Milestone Badge Unlocked!',
      message: `Congratulations! You unlocked the ${badge.replace('_', ' ')} badge!`,
      type: 'coins',
      link: '/participant/rewards',
    });
  }

  return {
    coinsAwarded: COIN_REWARD,
    newBalance: updatedBalance,
    newAttendedCount: updatedAttendedCount,
    unlockedBadges,
  };
};
