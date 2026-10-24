import mongoose, { Schema, Document } from 'mongoose';

export interface ICoinTransaction extends Document {
  userId: mongoose.Types.ObjectId;
  eventId?: mongoose.Types.ObjectId;
  amount: number; // e.g. +10, +50
  balanceAfter: number;
  type: 'attendance_reward' | 'milestone_reward' | 'streak_reward' | 'admin_adjustment';
  reason: string;
  idempotencyKey: string; // Unique idempotency key to prevent duplicate awards
  timestamp: Date;
}

const CoinTransactionSchema = new Schema<ICoinTransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event' },
    amount: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    type: {
      type: String,
      enum: ['attendance_reward', 'milestone_reward', 'streak_reward', 'admin_adjustment'],
      default: 'attendance_reward',
    },
    reason: { type: String, required: true },
    idempotencyKey: { type: String, required: true, unique: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

CoinTransactionSchema.index({ userId: 1, timestamp: -1 });

export const CoinTransaction = mongoose.model<ICoinTransaction>('CoinTransaction', CoinTransactionSchema);
