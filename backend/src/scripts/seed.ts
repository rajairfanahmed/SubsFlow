import mongoose from 'mongoose';
import { config } from '../config';
import { logger } from '../utils';
import { Plan } from '../models';

/**
 * Database seeding script
 * Creates default plans and admin user
 */

const defaultPlans = [
  {
    name: 'Free',
    slug: 'free',
    description: 'Get started with basic features',
    price: 0,
    currency: 'usd',
    interval: 'month' as const,
    intervalCount: 1,
    trialDays: 0,
    features: [
      { name: 'Basic content access', included: true },
      { name: 'Community support', included: true },
      { name: 'Premium content', included: false },
      { name: 'Priority support', included: false },
    ],
    tierLevel: 0,
    stripePriceId: 'price_free',
    stripeProductId: 'prod_free',
    isActive: true,
    sortOrder: 0,
  },
  {
    name: 'Starter',
    slug: 'starter',
    description: 'Perfect for individuals getting started',
    price: 999, // $9.99
    currency: 'usd',
    interval: 'month' as const,
    intervalCount: 1,
    trialDays: 7,
    features: [
      { name: 'All Free features', included: true },
      { name: 'Premium content access', included: true },
      { name: 'Email support', included: true },
      { name: 'Download content', included: false },
    ],
    tierLevel: 1,
    stripePriceId: 'price_starter_monthly',
    stripeProductId: 'prod_starter',
    isActive: true,
    sortOrder: 1,
  },
  {
    name: 'Pro',
    slug: 'pro',
    description: 'For professionals who need more',
    price: 2499, // $24.99
    currency: 'usd',
    interval: 'month' as const,
    intervalCount: 1,
    trialDays: 14,
    features: [
      { name: 'All Starter features', included: true },
      { name: 'Download content', included: true },
      { name: 'Priority support', included: true },
      { name: 'Early access to new content', included: true },
    ],
    tierLevel: 2,
    stripePriceId: 'price_pro_monthly',
    stripeProductId: 'prod_pro',
    isActive: true,
    sortOrder: 2,
  },
  {
    name: 'Enterprise',
    slug: 'enterprise',
    description: 'For teams and organizations',
    price: 9999, // $99.99
    currency: 'usd',
    interval: 'month' as const,
    intervalCount: 1,
    trialDays: 30,
    features: [
      { name: 'All Pro features', included: true },
      { name: 'Team management', included: true },
      { name: 'API access', included: true },
      { name: 'Dedicated account manager', included: true },
      { name: 'Custom integrations', included: true },
    ],
    tierLevel: 3,
    stripePriceId: 'price_enterprise_monthly',
    stripeProductId: 'prod_enterprise',
    isActive: true,
    sortOrder: 3,
  },
];

async function seed() {
  try {
    await mongoose.connect(config.mongodb.uri);
    logger.info('Connected to MongoDB');

    // Seed plans
    for (const planData of defaultPlans) {
      const existing = await Plan.findOne({ slug: planData.slug });
      if (!existing) {
        await Plan.create(planData);
        logger.info(`Created plan: ${planData.name}`);
      } else {
        logger.info(`Plan already exists: ${planData.name}`);
      }
    }

    logger.info('Seeding completed successfully');
  } catch (error) {
    logger.error('Seeding failed', { error });
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
