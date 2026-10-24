import mongoose, { Schema, Document } from 'mongoose';

export interface IAchievement extends Document {
  code: string; // e.g. 'FIRST_EVENT', 'FIVE_EVENTS', 'TEN_EVENTS', 'COIN_CENTURION'
  title: string;
  description: string;
  badgeIcon: string;
  category: 'attendance' | 'coins' | 'domain' | 'special';
  threshold: number;
  bonusCoins: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  createdAt: Date;
}

const AchievementSchema = new Schema<IAchievement>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    badgeIcon: { type: String, required: true },
    category: {
      type: String,
      enum: ['attendance', 'coins', 'domain', 'special'],
      default: 'attendance',
    },
    threshold: { type: Number, required: true },
    bonusCoins: { type: Number, default: 0 },
    tier: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum'],
      default: 'bronze',
    },
  },
  { timestamps: true }
);

export const Achievement = mongoose.model<IAchievement>('Achievement', AchievementSchema);
