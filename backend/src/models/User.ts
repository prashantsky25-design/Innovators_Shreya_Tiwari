import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash?: string;
  role: 'participant' | 'organizer' | 'admin';
  avatarUrl?: string;
  organization?: string;
  interests: string[];
  eventCoinsBalance: number;
  totalCoinsEarned: number;
  eventsAttendedCount: number;
  badges: string[];
  isLeaderboardOptedIn: boolean;
  authProvider: 'local' | 'google';
  googleId?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: false },
    role: { type: String, enum: ['participant', 'organizer', 'admin'], default: 'participant' },
    avatarUrl: { type: String, default: '' },
    organization: { type: String, default: '' },
    interests: [{ type: String }],
    eventCoinsBalance: { type: Number, default: 0, min: 0 },
    totalCoinsEarned: { type: Number, default: 0, min: 0 },
    eventsAttendedCount: { type: Number, default: 0, min: 0 },
    badges: [{ type: String }],
    isLeaderboardOptedIn: { type: Boolean, default: true },
    authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
    googleId: { type: String, sparse: true },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ eventCoinsBalance: -1 });
UserSchema.index({ googleId: 1 }, { sparse: true });

export const User = mongoose.model<IUser>('User', UserSchema);
