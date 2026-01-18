import { Schema, model, Document, Types } from 'mongoose';

/**
 * In-App Notification model for real-time notifications
 */
export interface IInAppNotificationDocument extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: string;
  title: string;
  message: string;
  icon?: string;
  actionUrl?: string;
  read: boolean;
  readAt?: Date;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  expiresAt?: Date;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const inAppNotificationSchema = new Schema<IInAppNotificationDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    maxlength: 200,
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  icon: { type: String },
  actionUrl: { type: String },
  read: {
    type: Boolean,
    default: false,
    index: true,
  },
  readAt: { type: Date },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal',
  },
  expiresAt: { type: Date },
  metadata: { type: Schema.Types.Mixed },
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

// Compound indexes for common queries
inAppNotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
inAppNotificationSchema.index({ userId: 1, type: 1, createdAt: -1 });

// TTL index - remove read notifications older than 30 days
inAppNotificationSchema.index(
  { createdAt: 1 },
  { 
    expireAfterSeconds: 30 * 24 * 60 * 60,
    partialFilterExpression: { read: true }
  }
);

// TTL for expired notifications
inAppNotificationSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

export const InAppNotification = model<IInAppNotificationDocument>('InAppNotification', inAppNotificationSchema);
