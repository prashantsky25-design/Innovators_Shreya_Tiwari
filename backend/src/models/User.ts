import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'participant' | 'organizer' | 'admin';
  avatarUrl?: string;
  organization?: string;
  interests: string[];
  eventCoinsBalance: number;
  totalCoinsEarned: number;
  eventsAttendedCount: number;
  badges: string[];
  isLeaderboardOptedIn: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['participant', 'organizer', 'admin'], default: 'participant' },
    avatarUrl: { type: String, default: '' },
    organization: { type: String, default: '' },
    interests: [{ type: String }],
    eventCoinsBalance: { type: Number, default: 0, min: 0 },
    totalCoinsEarned: { type: Number, default: 0, min: 0 },
    eventsAttendedCount: { type: Number, default: 0, min: 0 },
    badges: [{ type: String }],
    isLeaderboardOptedIn: { type: Boolean, default: true },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ eventCoinsBalance: -1 });

export const User = mongoose.model<IUser>('User', UserSchema);
