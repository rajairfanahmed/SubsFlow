# SubsFlow Backend - MongoDB Schema Design

**Document Version:** 1.0  
**Last Updated:** 2026-01-13  
**Status:** Approved

---

## Table of Contents

1. [Schema Overview](#schema-overview)
2. [Users Collection](#users-collection)
3. [Subscription Plans Collection](#subscription-plans-collection)
4. [Subscriptions Collection](#subscriptions-collection)
5. [Payments Collection](#payments-collection)
6. [Content Collection](#content-collection)
7. [Notifications Collection](#notifications-collection)
8. [Analytics Events Collection](#analytics-events-collection)
9. [Background Jobs Collection](#background-jobs-collection)
10. [Indexes Strategy](#indexes-strategy)

---

## Schema Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        SUBSFLOW DATA MODEL                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌─────────┐         ┌──────────────┐         ┌─────────────────┐     │
│   │  Users  │────────▶│ Subscriptions│────────▶│ Subscription    │     │
│   │         │   1:N   │              │   N:1   │ Plans           │     │
│   └────┬────┘         └──────┬───────┘         └─────────────────┘     │
│        │                     │                                          │
│        │ 1:N                 │ 1:N                                      │
│        ▼                     ▼                                          │
│   ┌─────────────┐      ┌─────────────┐                                 │
│   │Notifications│      │  Payments   │                                 │
│   └─────────────┘      └─────────────┘                                 │
│                                                                         │
│   ┌─────────┐    1:N   ┌─────────────────┐                             │
│   │ Content │─────────▶│Content Access   │                             │
│   │         │          │    Logs         │                             │
│   └─────────┘          └─────────────────┘                             │
│                                                                         │
│   ┌─────────────────┐  ┌─────────────────┐                             │
│   │Analytics Events │  │ Background Jobs │                             │
│   │  (Time Series)  │  │    (Queue)      │                             │
│   └─────────────────┘  └─────────────────┘                             │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Users Collection

### Schema Definition

```typescript
// models/user.model.ts
import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name: string;
  phone?: string;
  avatarUrl?: string;
  role: 'subscriber' | 'content_manager' | 'admin';
  status: 'active' | 'suspended' | 'deleted';
  emailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  stripeCustomerId?: string;
  preferences: {
    notifications: {
      email: boolean;
      renewalReminders: boolean;
      productUpdates: boolean;
    };
    timezone: string;
  };
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 60 // bcrypt hash length
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: 100
  },
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[1-9]\d{1,14}$/, 'Invalid phone format']
  },
  avatarUrl: String,
  role: {
    type: String,
    enum: ['subscriber', 'content_manager', 'admin'],
    default: 'subscriber'
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'deleted'],
    default: 'active'
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: String,
  stripeCustomerId: {
    type: String,
    sparse: true // Allow null but unique when present
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      renewalReminders: { type: Boolean, default: true },
      productUpdates: { type: Boolean, default: false }
    },
    timezone: { type: String, default: 'UTC' }
  },
  lastLoginAt: Date
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      delete ret.passwordHash;
      delete ret.twoFactorSecret;
      delete ret.emailVerificationToken;
      delete ret.passwordResetToken;
      return ret;
    }
  }
});

export const User = model<IUser>('User', userSchema);
```

### Validation Rules

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| email | String | ✅ | Unique, lowercase, email format |
| passwordHash | String | ✅ | Min 60 chars (bcrypt) |
| name | String | ✅ | Max 100 chars |
| phone | String | ❌ | E.164 format |
| role | Enum | ✅ | subscriber, content_manager, admin |
| status | Enum | ✅ | active, suspended, deleted |

### Indexes

```javascript
// Unique indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ stripeCustomerId: 1 }, { unique: true, sparse: true });

// Query optimization
userSchema.index({ status: 1, role: 1 });
userSchema.index({ emailVerificationToken: 1 }, { sparse: true });
userSchema.index({ passwordResetToken: 1 }, { sparse: true });
```

---

## Subscription Plans Collection

### Schema Definition

```typescript
// models/plan.model.ts
export interface IPlan extends Document {
  name: string;
  slug: string;
  description: string;
  price: number; // In cents
  currency: string;
  interval: 'month' | 'year';
  intervalCount: number;
  trialDays: number;
  features: Array<{
    name: string;
    included: boolean;
    limit?: number;
  }>;
  tierLevel: number; // 1 = Basic, 2 = Premium, 3 = Enterprise
  stripePriceId: string;
  stripeProductId: string;
  isActive: boolean;
  sortOrder: number;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const planSchema = new Schema<IPlan>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens']
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  price: {
    type: Number,
    required: true,
    min: 0 // 0 for free tier
  },
  currency: {
    type: String,
    default: 'usd',
    lowercase: true,
    enum: ['usd', 'eur', 'gbp']
  },
  interval: {
    type: String,
    required: true,
    enum: ['month', 'year']
  },
  intervalCount: {
    type: Number,
    default: 1,
    min: 1
  },
  trialDays: {
    type: Number,
    default: 0,
    min: 0,
    max: 90
  },
  features: [{
    name: { type: String, required: true },
    included: { type: Boolean, default: true },
    limit: Number
  }],
  tierLevel: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  stripePriceId: {
    type: String,
    required: true
  },
  stripeProductId: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });

export const Plan = model<IPlan>('Plan', planSchema);
```

### Sample Plan Documents

```javascript
// Basic Plan
{
  name: "Basic",
  slug: "basic",
  price: 999, // $9.99
  interval: "month",
  trialDays: 14,
  tierLevel: 1,
  features: [
    { name: "HD Video Access", included: true },
    { name: "Monthly Downloads", included: true, limit: 5 },
    { name: "Email Support", included: true }
  ]
}

// Premium Plan
{
  name: "Premium",
  slug: "premium",
  price: 1999, // $19.99
  interval: "month",
  trialDays: 14,
  tierLevel: 2,
  features: [
    { name: "4K Video Access", included: true },
    { name: "Unlimited Downloads", included: true },
    { name: "Priority Support", included: true },
    { name: "Exclusive Content", included: true }
  ]
}
```

---

## Subscriptions Collection

### Schema Definition

```typescript
// models/subscription.model.ts
export type SubscriptionStatus = 
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'unpaid'
  | 'canceled'
  | 'expired';

export interface ISubscription extends Document {
  userId: Types.ObjectId;
  planId: Types.ObjectId;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialStart?: Date;
  trialEnd?: Date;
  canceledAt?: Date;
  cancelAtPeriodEnd: boolean;
  cancelReason?: string;
  pausedAt?: Date;
  resumesAt?: Date;
  paymentMethod: {
    brand: string;
    last4: string;
    expiryMonth: number;
    expiryYear: number;
  };
  proration: {
    credit: number;
    appliedAt?: Date;
  };
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  planId: {
    type: Schema.Types.ObjectId,
    ref: 'Plan',
    required: true
  },
  stripeSubscriptionId: {
    type: String,
    required: true,
    unique: true
  },
  stripeCustomerId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['trialing', 'active', 'past_due', 'unpaid', 'canceled', 'expired'],
    default: 'trialing'
  },
  currentPeriodStart: {
    type: Date,
    required: true
  },
  currentPeriodEnd: {
    type: Date,
    required: true
  },
  trialStart: Date,
  trialEnd: Date,
  canceledAt: Date,
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  },
  cancelReason: {
    type: String,
    enum: ['too_expensive', 'not_using', 'missing_features', 'other']
  },
  pausedAt: Date,
  resumesAt: Date,
  paymentMethod: {
    brand: String,
    last4: String,
    expiryMonth: Number,
    expiryYear: Number
  },
  proration: {
    credit: { type: Number, default: 0 },
    appliedAt: Date
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });

// Ensure one active subscription per user
subscriptionSchema.index(
  { userId: 1, status: 1 },
  { 
    unique: true,
    partialFilterExpression: { 
      status: { $in: ['trialing', 'active', 'past_due'] }
    }
  }
);

export const Subscription = model<ISubscription>('Subscription', subscriptionSchema);
```

### Status State Machine

```
                    ┌──────────────┐
                    │   trialing   │
                    └──────┬───────┘
                           │
            payment success│
                           ▼
    ┌──────────────────────────────────────────┐
    │                 active                    │
    └────────┬─────────────────────┬───────────┘
             │                     │
  payment    │                     │ user cancels
  fails      │                     │ (end of period)
             ▼                     ▼
    ┌────────────────┐    ┌────────────────┐
    │   past_due     │    │   canceled     │
    │ (grace period) │    │(access until   │
    └────────┬───────┘    │ period end)    │
             │            └────────┬───────┘
   retries   │                     │
   exhaust   │                     │ period ends
             ▼                     ▼
    ┌────────────────┐    ┌────────────────┐
    │    unpaid      │    │    expired     │
    │ (no access)    │    │  (no access)   │
    └────────────────┘    └────────────────┘
```

---

## Payments Collection

### Schema Definition

```typescript
// models/payment.model.ts
export interface IPayment extends Document {
  userId: Types.ObjectId;
  subscriptionId: Types.ObjectId;
  stripePaymentIntentId: string;
  stripeInvoiceId?: string;
  amount: number; // In cents
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded' | 'disputed';
  paymentMethod: {
    type: string;
    brand: string;
    last4: string;
  };
  billingDetails: {
    name?: string;
    email?: string;
    address?: {
      line1?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
    };
  };
  failureCode?: string;
  failureMessage?: string;
  refundedAmount?: number;
  refundReason?: string;
  disputeId?: string;
  invoiceUrl?: string;
  receiptUrl?: string;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  subscriptionId: {
    type: Schema.Types.ObjectId,
    ref: 'Subscription',
    required: true
  },
  stripePaymentIntentId: {
    type: String,
    required: true,
    unique: true
  },
  stripeInvoiceId: String,
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    lowercase: true,
    default: 'usd'
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'succeeded', 'failed', 'refunded', 'disputed']
  },
  paymentMethod: {
    type: { type: String },
    brand: String,
    last4: String
  },
  billingDetails: {
    name: String,
    email: String,
    address: {
      line1: String,
      city: String,
      state: String,
      postalCode: String,
      country: String
    }
  },
  failureCode: String,
  failureMessage: String,
  refundedAmount: {
    type: Number,
    default: 0
  },
  refundReason: String,
  disputeId: String,
  invoiceUrl: String,
  receiptUrl: String,
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });

// Indexes for reporting
paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ userId: 1, createdAt: -1 });

export const Payment = model<IPayment>('Payment', paymentSchema);
```

---

## Content Collection

### Schema Definition

```typescript
// models/content.model.ts
export interface IContent extends Document {
  title: string;
  slug: string;
  description: string;
  type: 'video' | 'article' | 'course' | 'download';
  status: 'draft' | 'published' | 'archived';
  requiredTier: number; // Minimum tier level for access
  fileUrl?: string;
  thumbnailUrl?: string;
  duration?: number; // For video, in seconds
  wordCount?: number; // For articles
  author: Types.ObjectId;
  tags: string[];
  category: string;
  publishedAt?: Date;
  engagement: {
    views: number;
    completions: number;
    avgTimeSpent: number;
    bookmarks: number;
  };
  seo: {
    metaTitle?: string;
    metaDescription?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const contentSchema = new Schema<IContent>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  type: {
    type: String,
    required: true,
    enum: ['video', 'article', 'course', 'download']
  },
  status: {
    type: String,
    required: true,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  requiredTier: {
    type: Number,
    required: true,
    min: 0, // 0 = free/preview content
    max: 10
  },
  fileUrl: String,
  thumbnailUrl: String,
  duration: Number,
  wordCount: Number,
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{ type: String, lowercase: true }],
  category: {
    type: String,
    required: true
  },
  publishedAt: Date,
  engagement: {
    views: { type: Number, default: 0 },
    completions: { type: Number, default: 0 },
    avgTimeSpent: { type: Number, default: 0 },
    bookmarks: { type: Number, default: 0 }
  },
  seo: {
    metaTitle: String,
    metaDescription: String
  }
}, { timestamps: true });

// Indexes
contentSchema.index({ slug: 1 }, { unique: true });
contentSchema.index({ status: 1, publishedAt: -1 });
contentSchema.index({ requiredTier: 1, status: 1 });
contentSchema.index({ tags: 1 });
contentSchema.index({ '$**': 'text' }); // Full-text search

export const Content = model<IContent>('Content', contentSchema);
```

---

## Notifications Collection

### Schema Definition

```typescript
// models/notification.model.ts
export interface INotification extends Document {
  userId: Types.ObjectId;
  type: string;
  channel: 'email' | 'in_app';
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  subject: string;
  body: string;
  templateId?: string;
  templateData?: Record<string, any>;
  sendgridMessageId?: string;
  scheduledFor?: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  failureReason?: string;
  retryCount: number;
  relatedEntity?: {
    type: 'subscription' | 'payment' | 'content';
    id: Types.ObjectId;
  };
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'welcome',
      'email_verification',
      'subscription_created',
      'payment_succeeded',
      'payment_failed',
      'renewal_reminder',
      'trial_ending',
      'subscription_canceled',
      'password_reset'
    ]
  },
  channel: {
    type: String,
    required: true,
    enum: ['email', 'in_app'],
    default: 'email'
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'sent', 'delivered', 'failed'],
    default: 'pending'
  },
  subject: { type: String, required: true },
  body: { type: String, required: true },
  templateId: String,
  templateData: Schema.Types.Mixed,
  sendgridMessageId: String,
  scheduledFor: Date,
  sentAt: Date,
  deliveredAt: Date,
  openedAt: Date,
  clickedAt: Date,
  failureReason: String,
  retryCount: { type: Number, default: 0 },
  relatedEntity: {
    type: { type: String, enum: ['subscription', 'payment', 'content'] },
    id: Schema.Types.ObjectId
  }
}, { timestamps: true });

// Prevent duplicate notifications
notificationSchema.index(
  { userId: 1, type: 1, 'relatedEntity.id': 1 },
  { unique: true, sparse: true }
);

// Query pending notifications
notificationSchema.index({ status: 1, scheduledFor: 1 });

export const Notification = model<INotification>('Notification', notificationSchema);
```

---

## Analytics Events Collection

### Schema Definition

```typescript
// models/analytics-event.model.ts
export interface IAnalyticsEvent extends Document {
  userId?: Types.ObjectId;
  sessionId: string;
  eventType: string;
  eventProperties: Record<string, any>;
  userAgent: string;
  ipAddress: string;
  country?: string;
  device: {
    type: 'desktop' | 'mobile' | 'tablet';
    os: string;
    browser: string;
  };
  referrer?: string;
  pageUrl?: string;
  timestamp: Date;
}

const analyticsEventSchema = new Schema<IAnalyticsEvent>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  eventType: {
    type: String,
    required: true,
    index: true
  },
  eventProperties: {
    type: Schema.Types.Mixed,
    default: {}
  },
  userAgent: String,
  ipAddress: String,
  country: String,
  device: {
    type: { type: String, enum: ['desktop', 'mobile', 'tablet'] },
    os: String,
    browser: String
  },
  referrer: String,
  pageUrl: String,
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: false, // Use timestamp field instead
  timeseries: {
    timeField: 'timestamp',
    metaField: 'eventType',
    granularity: 'hours'
  }
});

// TTL Index - Auto-delete after 90 days
analyticsEventSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export const AnalyticsEvent = model<IAnalyticsEvent>('AnalyticsEvent', analyticsEventSchema);
```

### Event Types Taxonomy

| Category | Event Types |
|----------|-------------|
| **User** | `user_registered`, `user_logged_in`, `user_logged_out`, `profile_updated` |
| **Subscription** | `plan_viewed`, `checkout_started`, `checkout_completed`, `subscription_upgraded`, `subscription_downgraded`, `subscription_canceled` |
| **Payment** | `payment_succeeded`, `payment_failed`, `refund_issued` |
| **Content** | `content_viewed`, `content_started`, `content_completed`, `content_bookmarked` |
| **Navigation** | `page_view`, `search_performed` |

---

## Background Jobs Collection

### Schema Definition

```typescript
// models/job.model.ts
export interface IJob extends Document {
  type: string;
  payload: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  priority: number;
  attempts: number;
  maxAttempts: number;
  scheduledFor: Date;
  startedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
  error?: string;
  result?: any;
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<IJob>({
  type: {
    type: String,
    required: true,
    enum: [
      'send_email',
      'sync_subscription',
      'aggregate_analytics',
      'renewal_reminder',
      'cleanup_expired_tokens'
    ]
  },
  payload: {
    type: Schema.Types.Mixed,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  priority: {
    type: Number,
    default: 0, // Higher = more important
    min: -10,
    max: 10
  },
  attempts: {
    type: Number,
    default: 0
  },
  maxAttempts: {
    type: Number,
    default: 3
  },
  scheduledFor: {
    type: Date,
    default: Date.now
  },
  startedAt: Date,
  completedAt: Date,
  failedAt: Date,
  error: String,
  result: Schema.Types.Mixed
}, { timestamps: true });

// Worker query: Get pending jobs
jobSchema.index({ status: 1, priority: -1, scheduledFor: 1 });

// Cleanup query
jobSchema.index({ status: 1, completedAt: 1 });

export const Job = model<IJob>('Job', jobSchema);
```

---

## Indexes Strategy

### Index Summary Table

| Collection | Index | Type | Purpose |
|------------|-------|------|---------|
| **users** | `email` | Unique | Login lookup |
| **users** | `stripeCustomerId` | Unique, Sparse | Stripe sync |
| **plans** | `slug` | Unique | URL lookup |
| **plans** | `isActive, sortOrder` | Compound | Active plans list |
| **subscriptions** | `stripeSubscriptionId` | Unique | Webhook lookup |
| **subscriptions** | `userId, status` | Partial Unique | One active per user |
| **subscriptions** | `currentPeriodEnd` | Single | Renewal queries |
| **payments** | `stripePaymentIntentId` | Unique | Idempotency |
| **payments** | `userId, createdAt` | Compound | User history |
| **content** | `slug` | Unique | URL lookup |
| **content** | `$**` | Text | Full-text search |
| **notifications** | `userId, type, relatedEntity.id` | Unique, Sparse | Deduplication |
| **analytics** | `timestamp` | TTL (90 days) | Auto-cleanup |
| **jobs** | `status, priority, scheduledFor` | Compound | Worker query |

### Index Creation Script

```javascript
// scripts/create-indexes.js
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ stripeCustomerId: 1 }, { unique: true, sparse: true });

db.plans.createIndex({ slug: 1 }, { unique: true });
db.plans.createIndex({ isActive: 1, sortOrder: 1 });

db.subscriptions.createIndex({ stripeSubscriptionId: 1 }, { unique: true });
db.subscriptions.createIndex({ currentPeriodEnd: 1 });

db.payments.createIndex({ stripePaymentIntentId: 1 }, { unique: true });
db.payments.createIndex({ userId: 1, createdAt: -1 });

db.content.createIndex({ slug: 1 }, { unique: true });
db.content.createIndex({ status: 1, publishedAt: -1 });

db.analyticsevents.createIndex(
  { timestamp: 1 },
  { expireAfterSeconds: 7776000 } // 90 days
);

db.jobs.createIndex({ status: 1, priority: -1, scheduledFor: 1 });
```

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-13 | Backend Team | Initial release |
