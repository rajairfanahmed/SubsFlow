import { z } from 'zod';

export const createCheckoutSessionSchema = z.object({
  priceId: z.string().min(1, 'Stripe Price ID is required'),
  successUrl: z.string().url('Invalid success URL'),
  cancelUrl: z.string().url('Invalid cancel URL'),
});

export const createPortalSessionSchema = z.object({
  returnUrl: z.string().url('Invalid return URL'),
});

export const cancelSubscriptionSchema = z.object({
  subscriptionId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Subscription ID format'),
  atPeriodEnd: z.boolean().default(true),
});

export const updateSubscriptionSchema = z.object({
  subscriptionId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Subscription ID format'),
  newPriceId: z.string().min(1, 'New Stripe Price ID is required'),
});
