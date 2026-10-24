import mongoose, { Schema, Document } from 'mongoose';

export interface IRegistrationCustomField {
  fieldName: string;
  fieldLabel: string;
  fieldType: 'text' | 'number' | 'select' | 'checkbox';
  required: boolean;
  options?: string[];
}

export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  organizerId: mongoose.Types.ObjectId;
  organizationId?: mongoose.Types.ObjectId;
  domain: string;
  tags: string[];
  coverImage: string;
  eligibility: string;
  startDate: Date;
  endDate: Date;
  registrationDeadline: Date;
  timezone: string;
  venueName: string;
  address: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  capacity: number;
  registeredCount: number;
  verifiedAttendanceCount: number;
  price: number; // 0 = Free
  instructions: string;
  isExternal: boolean;
  externalSourceUrl?: string;
  certificateEnabled: boolean;
  certificateTemplateId?: mongoose.Types.ObjectId;
  galleryEnabled: boolean;
  customFields: IRegistrationCustomField[];
  status: 'draft' | 'published' | 'completed' | 'cancelled';
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true },
    organizerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization' },
    domain: { type: String, required: true, trim: true },
    tags: [{ type: String, trim: true }],
    coverImage: { type: String, required: true },
    eligibility: { type: String, default: 'Open to All' },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    registrationDeadline: { type: Date, required: true },
    timezone: { type: String, default: 'UTC' },
    venueName: { type: String, required: true },
    address: { type: String, required: true },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
    },
    capacity: { type: Number, required: true, min: 1 },
    registeredCount: { type: Number, default: 0, min: 0 },
    verifiedAttendanceCount: { type: Number, default: 0, min: 0 },
    price: { type: Number, default: 0, min: 0 },
    instructions: { type: String, default: '' },
    isExternal: { type: Boolean, default: false },
    externalSourceUrl: { type: String, default: '' },
    certificateEnabled: { type: Boolean, default: true },
    certificateTemplateId: { type: Schema.Types.ObjectId, ref: 'CertificateTemplate' },
    galleryEnabled: { type: Boolean, default: true },
    customFields: [
      {
        fieldName: { type: String, required: true },
        fieldLabel: { type: String, required: true },
        fieldType: { type: String, enum: ['text', 'number', 'select', 'checkbox'], default: 'text' },
        required: { type: Boolean, default: false },
        options: [{ type: String }],
      },
    ],
    status: {
      type: String,
      enum: ['draft', 'published', 'completed', 'cancelled'],
      default: 'published',
    },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

EventSchema.index({ location: '2dsphere' });
EventSchema.index({ domain: 1 });
EventSchema.index({ startDate: 1 });
EventSchema.index({ organizerId: 1 });
EventSchema.index({ status: 1 });
EventSchema.index({ isFeatured: 1 });

export const Event = mongoose.model<IEvent>('Event', EventSchema);
