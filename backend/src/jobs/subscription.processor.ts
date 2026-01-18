import { Job } from 'bull';
import { getSubscriptionQueue, SubscriptionJobData, addEmailJob } from './queues';
import { Subscription } from '../models';
import { logger } from '../utils';

export const processSubscriptionJobs = (): void => {
  const subscriptionQueue = getSubscriptionQueue();
  
  if (!subscriptionQueue) {
    logger.warn('Subscription queue not available, processor not started');
    return;
  }

  subscriptionQueue.process(async (job: Job<SubscriptionJobData>) => {
    const { type, batchSize = 100 } = job.data;

    logger.info('Processing subscription job', { jobId: job.id, type });

    try {
      switch (type) {
        case 'check_expiry':
          await processExpiringSubscriptions(batchSize);
          break;

        case 'send_renewal_reminders':
          await processRenewalReminders(batchSize);
          break;

        case 'process_trial_ending':
          await processTrialEndingNotifications(batchSize);
          break;

        case 'cleanup_expired':
          await cleanupExpiredSubscriptions(batchSize);
          break;

        default:
          throw new Error(`Unknown subscription job type: ${type}`);
      }

      logger.info('Subscription job completed', { jobId: job.id, type });
    } catch (error) {
      logger.error('Subscription job failed', { 
        jobId: job.id, 
        type, 
        error: error instanceof Error ? error.message : 'Unknown' 
      });
      throw error;
    }
  });

  logger.info('Subscription job processor started');
};

/**
 * Find and update subscriptions that have passed their period end
 */
async function processExpiringSubscriptions(batchSize: number): Promise<void> {
  const now = new Date();
  
  // Find active subscriptions past their end date
  const expiredSubscriptions = await Subscription.find({
    status: { $in: ['active', 'past_due'] },
    currentPeriodEnd: { $lt: now },
    cancelAtPeriodEnd: true,
  }).limit(batchSize);

  for (const subscription of expiredSubscriptions) {
    subscription.status = 'expired';
    await subscription.save();

    // Queue cancellation email
    await addEmailJob({
      type: 'subscription_canceled',
      userId: subscription.userId.toString(),
      subscriptionId: subscription._id.toString(),
    });

    logger.info('Subscription expired', { subscriptionId: subscription._id });
  }

  logger.info('Processed expiring subscriptions', { count: expiredSubscriptions.length });
}

/**
 * Send renewal reminders for subscriptions renewing in 3 days
 */
async function processRenewalReminders(batchSize: number): Promise<void> {
  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const fourDaysFromNow = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);

  // Find subscriptions renewing in ~3 days that aren't set to cancel
  const renewingSubscriptions = await Subscription.find({
    status: 'active',
    cancelAtPeriodEnd: false,
    currentPeriodEnd: { $gte: threeDaysFromNow, $lt: fourDaysFromNow },
  }).limit(batchSize);

  for (const subscription of renewingSubscriptions) {
    await addEmailJob({
      type: 'renewal_reminder',
      userId: subscription.userId.toString(),
      subscriptionId: subscription._id.toString(),
    });
  }

  logger.info('Queued renewal reminders', { count: renewingSubscriptions.length });
}

/**
 * Send trial ending notifications for trials ending in 2 days
 */
async function processTrialEndingNotifications(batchSize: number): Promise<void> {
  const now = new Date();
  const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  // Find trialing subscriptions ending in ~2 days
  const trialSubscriptions = await Subscription.find({
    status: 'trialing',
    trialEnd: { $gte: twoDaysFromNow, $lt: threeDaysFromNow },
  }).limit(batchSize);

  for (const subscription of trialSubscriptions) {
    await addEmailJob({
      type: 'trial_ending',
      userId: subscription.userId.toString(),
      subscriptionId: subscription._id.toString(),
    });
  }

  logger.info('Queued trial ending notifications', { count: trialSubscriptions.length });
}

/**
 * Clean up old expired subscriptions (archiving/anonymization)
 */
async function cleanupExpiredSubscriptions(batchSize: number): Promise<void> {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  // Find subscriptions expired more than 6 months ago
  const oldSubscriptions = await Subscription.find({
    status: 'expired',
    updatedAt: { $lt: sixMonthsAgo },
  }).limit(batchSize);

  logger.info('Found old expired subscriptions for cleanup', { 
    count: oldSubscriptions.length 
  });

  // For now, just log - actual cleanup policy depends on business requirements
}
