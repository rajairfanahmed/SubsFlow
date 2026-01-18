import { Job } from 'bull';
import { getEmailQueue, EmailJobData } from './queues';
import { notificationService } from '../services/notification.service';
import { logger } from '../utils';

export const processEmailJobs = (): void => {
  const emailQueue = getEmailQueue();
  
  if (!emailQueue) {
    logger.warn('Email queue not available, processor not started');
    return;
  }

  emailQueue.process(async (job: Job<EmailJobData>) => {
    const { type, userId, subscriptionId, token, amount, currency } = job.data;

    logger.info('Processing email job', { jobId: job.id, type, userId });

    try {
      switch (type) {
        case 'welcome':
          if (!token) throw new Error('Token required for welcome email');
          await notificationService.sendWelcomeNotification(userId, token);
          break;

        case 'password_reset':
          if (!token) throw new Error('Token required for password reset');
          await notificationService.sendPasswordResetNotification(userId, token);
          break;

        case 'subscription_confirmation':
          if (!subscriptionId) throw new Error('Subscription ID required');
          await notificationService.sendSubscriptionConfirmationNotification(subscriptionId);
          break;

        case 'payment_failed':
          if (!amount || !currency || !subscriptionId) {
            throw new Error('Amount, currency, and subscription ID required');
          }
          await notificationService.sendPaymentFailedNotification(
            userId, amount, currency, subscriptionId
          );
          break;

        case 'renewal_reminder':
          if (!subscriptionId) throw new Error('Subscription ID required');
          await notificationService.sendRenewalReminderNotification(subscriptionId);
          break;

        case 'trial_ending':
          if (!subscriptionId) throw new Error('Subscription ID required');
          await notificationService.sendTrialEndingNotification(subscriptionId);
          break;

        case 'subscription_canceled':
          if (!subscriptionId) throw new Error('Subscription ID required');
          await notificationService.sendSubscriptionCanceledNotification(subscriptionId);
          break;

        default:
          throw new Error(`Unknown email job type: ${type}`);
      }

      logger.info('Email job completed', { jobId: job.id, type });
    } catch (error) {
      logger.error('Email job failed', { 
        jobId: job.id, 
        type, 
        error: error instanceof Error ? error.message : 'Unknown' 
      });
      throw error; // Bull will retry
    }
  });

  logger.info('Email job processor started');
};
