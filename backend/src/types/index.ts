import { Types } from 'mongoose';

// ============ User Types ============
export type UserRole = 'subscriber' | 'content_manager' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'deleted';

export interface IUserPreferences {
  notifications: {
    email: boolean;
    renewalReminders: boolean;
    productUpdates: boolean;
  };
  timezone: string;
}

export interface IUser {
  _id: Types.ObjectId;
  email: string;
  passwordHash: string;
  name: string;
  phone?: string;
  avatarUrl?: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  stripeCustomerId?: string;
  preferences: IUserPreferences;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ============ Subscription Types ============
export type SubscriptionStatus = 
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'unpaid'
  | 'canceled'
  | 'expired';

export type PlanInterval = 'month' | 'year';
export type CancelReason = 'too_expensive' | 'not_using' | 'missing_features' | 'other';

export interface IPlanFeature {
  name: string;
  included: boolean;
  limit?: number;
}

export interface IPlan {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  price: number; // In cents
  currency: string;
  interval: PlanInterval;
  intervalCount: number;
  trialDays: number;
  features: IPlanFeature[];
  tierLevel: number;
  stripePriceId: string;
  stripeProductId: string;
  isActive: boolean;
  sortOrder: number;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPaymentMethod {
  brand: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
}

export interface ISubscription {
  _id: Types.ObjectId;
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
  cancelReason?: CancelReason;
  pausedAt?: Date;
  resumesAt?: Date;
  paymentMethod?: IPaymentMethod;
  proration: {
    credit: number;
    appliedAt?: Date;
  };
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// ============ Payment Types ============
export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded' | 'disputed';

export interface IBillingDetails {
  name?: string;
  email?: string;
  address?: {
    line1?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
}

export interface IPayment {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  subscriptionId: Types.ObjectId;
  stripePaymentIntentId: string;
  stripeInvoiceId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod?: {
    type: string;
    brand: string;
    last4: string;
  };
  billingDetails?: IBillingDetails;
  failureCode?: string;
  failureMessage?: string;
  refundedAmount?: number;
  refundReason?: string;
  disputeId?: string;
  invoiceUrl?: string;
  receiptUrl?: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// ============ Content Types ============
export type ContentType = 'video' | 'article' | 'course' | 'download';
export type ContentStatus = 'draft' | 'published' | 'archived';

export interface IContentEngagement {
  views: number;
  completions: number;
  avgTimeSpent: number;
  bookmarks: number;
}

export interface IContent {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  description: string;
  type: ContentType;
  status: ContentStatus;
  requiredTier: number;
  fileUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  wordCount?: number;
  author: Types.ObjectId;
  tags: string[];
  category: string;
  publishedAt?: Date;
  engagement: IContentEngagement;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// ============ Notification Types ============
export type NotificationType =
  | 'welcome'
  | 'email_verification'
  | 'subscription_created'
  | 'payment_succeeded'
  | 'payment_failed'
  | 'renewal_reminder'
  | 'trial_ending'
  | 'subscription_canceled'
  | 'password_reset';

export type NotificationChannel = 'email' | 'in_app';
export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'failed';

export interface INotification {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: NotificationType;
  channel: NotificationChannel;
  status: NotificationStatus;
  subject: string;
  body: string;
  templateId?: string;
  templateData?: Record<string, unknown>;
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

// ============ API Types ============
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
    requestId?: string;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============ Auth Types ============
export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: UserRole;
}
