import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  actorId?: mongoose.Types.ObjectId;
  actorEmail?: string;
  action: string;
  targetType: string;
  targetId?: string;
  ip?: string;
  userAgent?: string;
  details?: Record<string, any>;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    actorId: { type: Schema.Types.ObjectId, ref: 'User' },
    actorEmail: { type: String, default: '' },
    action: { type: String, required: true },
    targetType: { type: String, required: true },
    targetId: { type: String, default: '' },
    ip: { type: String, default: '127.0.0.1' },
    userAgent: { type: String, default: '' },
    details: { type: Schema.Types.Mixed, default: {} },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

AuditLogSchema.index({ action: 1 });
AuditLogSchema.index({ timestamp: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
