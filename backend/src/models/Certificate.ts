import mongoose, { Schema, Document } from 'mongoose';

export interface ICertificate extends Document {
  certificateId: string; // Unique serial (e.g. CERT-2026-9A82-44EF)
  eventId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  attendanceId: mongoose.Types.ObjectId;
  participantName: string;
  eventTitle: string;
  eventDate: Date;
  pdfPath: string; // Local relative path or cloud storage URL
  verificationUrl: string;
  status: 'issued' | 'revoked';
  issuedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CertificateSchema = new Schema<ICertificate>(
  {
    certificateId: { type: String, required: true, unique: true, index: true },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    attendanceId: { type: Schema.Types.ObjectId, ref: 'Attendance', required: true, unique: true },
    participantName: { type: String, required: true },
    eventTitle: { type: String, required: true },
    eventDate: { type: Date, required: true },
    pdfPath: { type: String, required: true },
    verificationUrl: { type: String, default: '' },
    status: {
      type: String,
      enum: ['issued', 'revoked'],
      default: 'issued',
    },
    issuedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Prevent duplicate certificates per user per event
CertificateSchema.index({ eventId: 1, userId: 1 }, { unique: true });

export const Certificate = mongoose.model<ICertificate>('Certificate', CertificateSchema);
