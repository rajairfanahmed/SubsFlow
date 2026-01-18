import { Schema, model, Document, Types } from 'mongoose';
import { IPlan, PlanInterval, IPlanFeature } from '../types';

export interface IPlanDocument extends Omit<IPlan, '_id'>, Document {
  _id: Types.ObjectId;
}

const planFeatureSchema = new Schema<IPlanFeature>({
  name: { type: String, required: true },
  included: { type: Boolean, default: true },
  limit: { type: Number },
}, { _id: false });

const planSchema = new Schema<IPlanDocument>({
  name: {
    type: String,
    required: [true, 'Plan name is required'],
    trim: true,
    maxlength: 50,
  },
  slug: {
    type: String,
    required: [true, 'Plan slug is required'],
    unique: true,
    lowercase: true,
    match: [/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'],
    index: true,
  },
  description: {
    type: String,
    required: [true, 'Plan description is required'],
    maxlength: 500,
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  currency: {
    type: String,
    default: 'usd',
    lowercase: true,
    enum: ['usd', 'eur', 'gbp'],
  },
  interval: {
    type: String,
    required: [true, 'Interval is required'],
    enum: {
      values: ['month', 'year'] as PlanInterval[],
      message: 'Invalid interval',
    },
  },
  intervalCount: {
    type: Number,
    default: 1,
    min: 1,
  },
  trialDays: {
    type: Number,
    default: 0,
    min: 0,
    max: 90,
  },
  features: {
    type: [planFeatureSchema],
    default: [],
  },
  tierLevel: {
    type: Number,
    required: [true, 'Tier level is required'],
    min: 1,
    max: 10,
    index: true,
  },
  stripePriceId: {
    type: String,
    required: [true, 'Stripe price ID is required'],
    index: true,
  },
  stripeProductId: {
    type: String,
    required: [true, 'Stripe product ID is required'],
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  sortOrder: {
    type: Number,
    default: 0,
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

// Compound indexes
planSchema.index({ isActive: 1, sortOrder: 1 });

export const Plan = model<IPlanDocument>('Plan', planSchema);
