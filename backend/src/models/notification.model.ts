import { Schema, model, Document, Types } from 'mongoose';
import { INotification, NotificationType, NotificationChannel, NotificationStatus } from '../types';

export interface INotificationDocument extends Omit<INotification, '_id'>, Document {
  _id: Types.ObjectId;
}

const notificationSchema = new Schema<INotificationDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true,
  },
  type: {
    type: String,
    required: [true, 'Notification type is required'],
    enum: {
      values: [
        'welcome',
        'email_verification',
        'subscription_created',
        'payment_succeeded',
        'payment_failed',
        'renewal_reminder',
        'trial_ending',
        'subscription_canceled',
        'password_reset',
      ] as NotificationType[],
      message: 'Invalid notification type',
    },
  },
  channel: {
    type: String,
    required: [true, 'Channel is required'],
    enum: {
      values: ['email', 'in_app'] as NotificationChannel[],
      message: 'Invalid notification channel',
    },
    default: 'email',
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: {
      values: ['pending', 'sent', 'delivered', 'failed'] as NotificationStatus[],
      message: 'Invalid notification status',
    },
    default: 'pending',
    index: true,
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
  },
  body: {
    type: String,
    required: [true, 'Body is required'],
  },
  templateId: { type: String },
  templateData: { type: Schema.Types.Mixed },
  sendgridMessageId: { type: String },
  scheduledFor: { type: Date },
  sentAt: { type: Date },
  deliveredAt: { type: Date },
  openedAt: { type: Date },
  clickedAt: { type: Date },
  failureReason: { type: String },
  retryCount: {
    type: Number,
    default: 0,
  },
  relatedEntity: {
    type: {
      type: String,
      enum: ['subscription', 'payment', 'content'],
    },
    id: { type: Schema.Types.ObjectId },
  },
}, {
  timestamps: true,
  toJSON: {
    transform(_doc, ret: Record<string, unknown>) {
      delete ret.__v;
      return ret;
    },
  },
});

// Indexes
notificationSchema.index(
  { userId: 1, type: 1, 'relatedEntity.id': 1 },
  { unique: true, sparse: true }
);
notificationSchema.index({ status: 1, scheduledFor: 1 });

export const Notification = model<INotificationDocument>('Notification', notificationSchema);
