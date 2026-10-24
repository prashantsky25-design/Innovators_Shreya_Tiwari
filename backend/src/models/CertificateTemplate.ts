import mongoose, { Schema, Document } from 'mongoose';

export interface ICertificateTemplate extends Document {
  organizerId: mongoose.Types.ObjectId;
  eventId?: mongoose.Types.ObjectId;
  name: string;
  title: string;
  subtitle: string;
  bodyText: string;
  signatureName: string;
  signatureTitle: string;
  signatureImageUrl?: string;
  primaryColor: string;
  accentColor: string;
  borderStyle: 'classic' | 'modern' | 'minimal' | 'golden';
  showQr: boolean;
  bgImageUrl?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CertificateTemplateSchema = new Schema<ICertificateTemplate>(
  {
    organizerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event' },
    name: { type: String, required: true, trim: true },
    title: { type: String, default: 'CERTIFICATE OF EXCELLENCE' },
    subtitle: { type: String, default: 'This is proudly presented to' },
    bodyText: {
      type: String,
      default: 'for active participation and outstanding commitment demonstrated during the event',
    },
    signatureName: { type: String, default: 'Event Director' },
    signatureTitle: { type: String, default: 'Lead Organizer, EventSphere' },
    signatureImageUrl: { type: String, default: '' },
    primaryColor: { type: String, default: '#4338ca' },
    accentColor: { type: String, default: '#eab308' },
    borderStyle: {
      type: String,
      enum: ['classic', 'modern', 'minimal', 'golden'],
      default: 'golden',
    },
    showQr: { type: Boolean, default: true },
    bgImageUrl: { type: String, default: '' },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const CertificateTemplate = mongoose.model<ICertificateTemplate>(
  'CertificateTemplate',
  CertificateTemplateSchema
);
