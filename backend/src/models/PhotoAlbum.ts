import mongoose, { Schema, Document } from 'mongoose';

export interface IPhotoItem {
  _id?: mongoose.Types.ObjectId;
  url: string;
  caption?: string;
  uploadedAt: Date;
  uploadedBy: mongoose.Types.ObjectId;
  width?: number;
  height?: number;
}

export interface IPhotoAlbum extends Document {
  eventId: mongoose.Types.ObjectId;
  organizerId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  photos: IPhotoItem[];
  isPublished: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PhotoItemSchema = new Schema<IPhotoItem>({
  url: { type: String, required: true },
  caption: { type: String, default: '' },
  uploadedAt: { type: Date, default: Date.now },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  width: { type: Number },
  height: { type: Number },
});

const PhotoAlbumSchema = new Schema<IPhotoAlbum>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, unique: true },
    organizerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    photos: [PhotoItemSchema],
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

PhotoAlbumSchema.index({ eventId: 1 });
PhotoAlbumSchema.index({ organizerId: 1 });

export const PhotoAlbum = mongoose.model<IPhotoAlbum>('PhotoAlbum', PhotoAlbumSchema);
