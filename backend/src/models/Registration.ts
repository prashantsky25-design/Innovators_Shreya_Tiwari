import mongoose, { Schema, Document } from 'mongoose';

export interface IRegistration extends Document {
  eventId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  status: 'registered' | 'attended' | 'cancelled';
  customAnswers: Record<string, any>;
  registeredAt: Date;
  updatedAt: Date;
}

const RegistrationSchema = new Schema<IRegistration>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['registered', 'attended', 'cancelled'],
      default: 'registered',
    },
    customAnswers: { type: Schema.Types.Mixed, default: {} },
    registeredAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Prevent duplicate active registrations per user per event
RegistrationSchema.index({ eventId: 1, userId: 1 }, { unique: true });

export const Registration = mongoose.model<IRegistration>('Registration', RegistrationSchema);
