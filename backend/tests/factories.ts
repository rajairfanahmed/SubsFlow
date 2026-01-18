import { Types } from 'mongoose';
import { User, Plan, Subscription, IUserDocument, IPlanDocument } from '../src/models';

/**
 * Factory functions for creating test data
 */

export async function createTestUser(overrides: Partial<IUserDocument> = {}): Promise<IUserDocument> {
  const defaults = {
    email: `test-${Date.now()}@example.com`,
    passwordHash: '$2b$10$test-password-hash',
    name: 'Test User',
    role: 'subscriber' as const,
    status: 'active' as const,
    emailVerified: true,
    twoFactorEnabled: false,
    preferences: {
      notifications: {
        email: true,
        renewalReminders: true,
        productUpdates: true,
      },
      timezone: 'UTC',
    },
  };

  return await User.create({ ...defaults, ...overrides });
}

export async function createTestAdmin(overrides: Partial<IUserDocument> = {}): Promise<IUserDocument> {
  return createTestUser({ ...overrides, role: 'admin' });
}

export async function createTestPlan(overrides: Partial<IPlanDocument> = {}): Promise<IPlanDocument> {
  const defaults = {
    name: 'Test Plan',
    slug: `test-plan-${Date.now()}`,
    description: 'A test subscription plan',
    price: 999, // $9.99 in cents
    currency: 'usd',
    interval: 'month' as const,
    intervalCount: 1,
    trialDays: 7,
    features: [
      { name: 'Feature 1', included: true },
      { name: 'Feature 2', included: true },
    ],
    tierLevel: 1,
    stripePriceId: `price_test_${Date.now()}`,
    stripeProductId: `prod_test_${Date.now()}`,
    isActive: true,
    sortOrder: 0,
  };

  return await Plan.create({ ...defaults, ...overrides });
}

export async function createTestSubscription(
  userId: Types.ObjectId,
  planId: Types.ObjectId,
  overrides: Record<string, unknown> = {}
) {
  const now = new Date();
  const endDate = new Date(now);
  endDate.setMonth(endDate.getMonth() + 1);

  const defaults = {
    userId,
    planId,
    stripeSubscriptionId: `sub_test_${Date.now()}`,
    stripeCustomerId: `cus_test_${Date.now()}`,
    status: 'active',
    currentPeriodStart: now,
    currentPeriodEnd: endDate,
    cancelAtPeriodEnd: false,
    proration: { credit: 0 },
    metadata: {},
  };

  return await Subscription.create({ ...defaults, ...overrides });
}

/**
 * Generate mock JWT token payload
 */
export function mockJwtPayload(userId: string, role: string = 'subscriber') {
  return {
    userId,
    email: 'test@example.com',
    role,
    type: 'access',
  };
}

/**
 * Clean up test data
 */
export async function cleanupTestData(): Promise<void> {
  await User.deleteMany({});
  await Plan.deleteMany({});
  await Subscription.deleteMany({});
}
