import mongoose, { Schema, Document } from 'mongoose';

export interface ITicket extends Document {
  ticketCode: string; // Human readable opaque code (e.g. ESP-8F92A-4B1C)
  ticketToken: string; // Cryptographic opaque token for QR validation
  eventId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  registrationId: mongoose.Types.ObjectId;
  status: 'active' | 'checked_in' | 'cancelled';
  qrDataUrl: string;
  checkedInAt?: Date;
  checkedInBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TicketSchema = new Schema<ITicket>(
  {
    ticketCode: { type: String, required: true, unique: true, index: true },
    ticketToken: { type: String, required: true, unique: true, index: true },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    registrationId: { type: Schema.Types.ObjectId, ref: 'Registration', required: true },
    status: {
      type: String,
      enum: ['active', 'checked_in', 'cancelled'],
      default: 'active',
    },
    qrDataUrl: { type: String, default: '' },
    checkedInAt: { type: Date },
    checkedInBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

TicketSchema.index({ eventId: 1, userId: 1 });
TicketSchema.index({ eventId: 1, status: 1 });

export const Ticket = mongoose.model<ITicket>('Ticket', TicketSchema);
