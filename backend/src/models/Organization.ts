import mongoose, { Schema, Document } from 'mongoose';

export interface IOrganization extends Document {
  name: string;
  slug: string;
  description: string;
  logoUrl: string;
  websiteUrl: string;
  ownerId: mongoose.Types.ObjectId;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSchema = new Schema<IOrganization>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
    logoUrl: { type: String, default: '' },
    websiteUrl: { type: String, default: '' },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

OrganizationSchema.index({ ownerId: 1 });

export const Organization = mongoose.model<IOrganization>('Organization', OrganizationSchema);
