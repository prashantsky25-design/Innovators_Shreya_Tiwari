import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendance extends Document {
  eventId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  ticketId: mongoose.Types.ObjectId;
  registrationId: mongoose.Types.ObjectId;
  verifiedAt: Date;
  verifiedBy: mongoose.Types.ObjectId; // Organizer or authorized staff user ID
  checkInMethod: 'qr_scan' | 'manual_override';
  deviceInfo?: string;
  notes?: string;
  createdAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    ticketId: { type: Schema.Types.ObjectId, ref: 'Ticket', required: true, unique: true },
    registrationId: { type: Schema.Types.ObjectId, ref: 'Registration', required: true },
    verifiedAt: { type: Date, default: Date.now, required: true },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    checkInMethod: {
      type: String,
      enum: ['qr_scan', 'manual_override'],
      default: 'qr_scan',
    },
    deviceInfo: { type: String, default: 'Web Scanner' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

// Unique compound index: ONE verified attendance record per user per event
AttendanceSchema.index({ eventId: 1, userId: 1 }, { unique: true });
AttendanceSchema.index({ eventId: 1, verifiedAt: -1 });

export const Attendance = mongoose.model<IAttendance>('Attendance', AttendanceSchema);
