import { Schema, model, Document, Types } from 'mongoose';

/**
 * ContentAccess model for logging content access events
 * Used for analytics and audit trails
 */
export interface IContentAccessDocument extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  contentId: Types.ObjectId;
  subscriptionId?: Types.ObjectId;
  accessType: 'view' | 'download' | 'stream' | 'complete';
  accessGranted: boolean;
  denialReason?: string;
  userAgent?: string;
  ipAddress?: string;
  duration?: number; // Time spent in seconds
  completionPercent?: number;
  createdAt: Date;
}

const contentAccessSchema = new Schema<IContentAccessDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  contentId: {
    type: Schema.Types.ObjectId,
    ref: 'Content',
    required: true,
    index: true,
  },
  subscriptionId: {
    type: Schema.Types.ObjectId,
    ref: 'Subscription',
  },
  accessType: {
    type: String,
    required: true,
    enum: ['view', 'download', 'stream', 'complete'],
    default: 'view',
  },
  accessGranted: {
    type: Boolean,
    required: true,
    index: true,
  },
  denialReason: { type: String },
  userAgent: { type: String },
  ipAddress: { type: String },
  duration: { type: Number },
  completionPercent: { type: Number, min: 0, max: 100 },
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

// Indexes for analytics queries
contentAccessSchema.index({ createdAt: -1 });
contentAccessSchema.index({ userId: 1, contentId: 1, createdAt: -1 });
contentAccessSchema.index({ contentId: 1, accessGranted: 1, createdAt: -1 });

// TTL index - remove access logs older than 1 year
contentAccessSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 365 * 24 * 60 * 60 }
);

export const ContentAccess = model<IContentAccessDocument>('ContentAccess', contentAccessSchema);
