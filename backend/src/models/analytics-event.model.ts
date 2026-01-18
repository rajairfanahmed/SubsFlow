import { Schema, model, Document, Types } from 'mongoose';

/**
 * Analytics Event model for tracking user actions and system events
 */
export type AnalyticsEventType = 
  | 'page_view'
  | 'content_view'
  | 'content_complete'
  | 'subscription_started'
  | 'subscription_canceled'
  | 'subscription_renewed'
  | 'payment_succeeded'
  | 'payment_failed'
  | 'login'
  | 'signup'
  | 'search'
  | 'feature_used';

export interface IAnalyticsEventDocument extends Document {
  _id: Types.ObjectId;
  userId?: Types.ObjectId;
  sessionId?: string;
  eventType: AnalyticsEventType;
  eventName: string;
  properties: Record<string, unknown>;
  deviceInfo?: {
    userAgent?: string;
    platform?: string;
    browser?: string;
    deviceType?: string;
  };
  location?: {
    country?: string;
    region?: string;
    city?: string;
  };
  referrer?: string;
  pageUrl?: string;
  timestamp: Date;
  createdAt: Date;
}

const analyticsEventSchema = new Schema<IAnalyticsEventDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  sessionId: { type: String, index: true },
  eventType: {
    type: String,
    required: true,
    enum: [
      'page_view', 'content_view', 'content_complete',
      'subscription_started', 'subscription_canceled', 'subscription_renewed',
      'payment_succeeded', 'payment_failed',
      'login', 'signup', 'search', 'feature_used'
    ],
    index: true,
  },
  eventName: {
    type: String,
    required: true,
    index: true,
  },
  properties: {
    type: Schema.Types.Mixed,
    default: {},
  },
  deviceInfo: {
    userAgent: String,
    platform: String,
    browser: String,
    deviceType: String,
  },
  location: {
    country: String,
    region: String,
    city: String,
  },
  referrer: String,
  pageUrl: String,
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
    index: true,
  },
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

// Compound indexes for analytics queries
analyticsEventSchema.index({ eventType: 1, timestamp: -1 });
analyticsEventSchema.index({ userId: 1, eventType: 1, timestamp: -1 });
analyticsEventSchema.index({ timestamp: -1, eventType: 1 });

// TTL index - remove events older than 2 years
analyticsEventSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 2 * 365 * 24 * 60 * 60 }
);

export const AnalyticsEvent = model<IAnalyticsEventDocument>('AnalyticsEvent', analyticsEventSchema);
