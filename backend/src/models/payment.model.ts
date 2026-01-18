import { Schema, model, Document, Types } from 'mongoose';
import { IPayment, PaymentStatus, IBillingDetails } from '../types';

export interface IPaymentDocument extends Omit<IPayment, '_id'>, Document {
  _id: Types.ObjectId;
}

const billingDetailsSchema = new Schema<IBillingDetails>({
  name: { type: String },
  email: { type: String },
  address: {
    line1: { type: String },
    city: { type: String },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String },
  },
}, { _id: false });

const paymentSchema = new Schema<IPaymentDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true,
  },
  subscriptionId: {
    type: Schema.Types.ObjectId,
    ref: 'Subscription',
    required: [true, 'Subscription ID is required'],
  },
  stripePaymentIntentId: {
    type: String,
    required: [true, 'Stripe payment intent ID is required'],
    unique: true,
    index: true,
  },
  stripeInvoiceId: {
    type: String,
    sparse: true,
    index: true,
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: 0,
  },
  currency: {
    type: String,
    required: [true, 'Currency is required'],
    lowercase: true,
    default: 'usd',
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: {
      values: ['pending', 'succeeded', 'failed', 'refunded', 'disputed'] as PaymentStatus[],
      message: 'Invalid payment status',
    },
    index: true,
  },
  paymentMethod: {
    type: { type: String },
    brand: { type: String },
    last4: { type: String },
  },
  billingDetails: {
    type: billingDetailsSchema,
  },
  failureCode: { type: String },
  failureMessage: { type: String },
  refundedAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  refundReason: { type: String },
  disputeId: { type: String },
  invoiceUrl: { type: String },
  receiptUrl: { type: String },
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

// Compound indexes for reporting
paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ userId: 1, createdAt: -1 });

export const Payment = model<IPaymentDocument>('Payment', paymentSchema);
