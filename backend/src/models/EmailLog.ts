import mongoose, { Schema, Document } from 'mongoose';

export interface IEmailLog extends Document {
  recipient: string;
  subject: string;
  type: string;
  status: 'sent' | 'failed' | 'simulated';
  previewUrl?: string;
  error?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const EmailLogSchema = new Schema<IEmailLog>(
  {
    recipient: { type: String, required: true },
    subject: { type: String, required: true },
    type: { type: String, required: true },
    status: {
      type: String,
      enum: ['sent', 'failed', 'simulated'],
      default: 'sent',
    },
    previewUrl: { type: String, default: '' },
    error: { type: String, default: '' },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

EmailLogSchema.index({ recipient: 1 });
EmailLogSchema.index({ createdAt: -1 });

export const EmailLog = mongoose.model<IEmailLog>('EmailLog', EmailLogSchema);
