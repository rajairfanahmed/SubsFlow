import { Schema, model, Document, Types } from 'mongoose';
import { ISubscription, SubscriptionStatus, CancelReason, IPaymentMethod } from '../types';

export interface ISubscriptionDocument extends Omit<ISubscription, '_id'>, Document {
  _id: Types.ObjectId;
  isActive(): boolean;
  hasAccess(): boolean;
}

const paymentMethodSchema = new Schema<IPaymentMethod>({
  brand: { type: String },
  last4: { type: String },
  expiryMonth: { type: Number },
  expiryYear: { type: Number },
}, { _id: false });

const subscriptionSchema = new Schema<ISubscriptionDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true,
  },
  planId: {
    type: Schema.Types.ObjectId,
    ref: 'Plan',
    required: [true, 'Plan ID is required'],
  },
  stripeSubscriptionId: {
    type: String,
    required: [true, 'Stripe subscription ID is required'],
    unique: true,
    index: true,
  },
  stripeCustomerId: {
    type: String,
    required: [true, 'Stripe customer ID is required'],
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: {
      values: ['trialing', 'active', 'past_due', 'unpaid', 'canceled', 'expired'] as SubscriptionStatus[],
      message: 'Invalid subscription status',
    },
    default: 'trialing',
    index: true,
  },
  currentPeriodStart: {
    type: Date,
    required: [true, 'Current period start is required'],
  },
  currentPeriodEnd: {
    type: Date,
    required: [true, 'Current period end is required'],
    index: true,
  },
  trialStart: { type: Date },
  trialEnd: { type: Date },
  canceledAt: { type: Date },
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false,
  },
  cancelReason: {
    type: String,
    enum: {
      values: ['too_expensive', 'not_using', 'missing_features', 'other'] as CancelReason[],
      message: 'Invalid cancel reason',
    },
  },
  pausedAt: { type: Date },
  resumesAt: { type: Date },
  paymentMethod: {
    type: paymentMethodSchema,
  },
  proration: {
    credit: { type: Number, default: 0 },
    appliedAt: { type: Date },
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {},
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

// Partial unique index: Only one active subscription per user
subscriptionSchema.index(
  { userId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ['trialing', 'active', 'past_due'] },
    },
  }
);

// Methods
subscriptionSchema.methods.isActive = function(): boolean {
  return ['trialing', 'active', 'past_due'].includes(this.status);
};

subscriptionSchema.methods.hasAccess = function(): boolean {
  // Has access if active OR if canceled but period hasn't ended yet
  if (this.isActive()) return true;
  
  if (this.status === 'canceled' && this.currentPeriodEnd > new Date()) {
    return true;
  }
  
  return false;
};

export const Subscription = model<ISubscriptionDocument>('Subscription', subscriptionSchema);
