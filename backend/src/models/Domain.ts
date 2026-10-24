import mongoose, { Schema, Document } from 'mongoose';

export interface IDomain extends Document {
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  isActive: boolean;
}

const DomainSchema = new Schema<IDomain>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
    icon: { type: String, default: 'Globe' },
    color: { type: String, default: '#6366f1' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Domain = mongoose.model<IDomain>('Domain', DomainSchema);
