import Queue, { Job, JobOptions } from 'bull';
import { config } from '../config';
import { logger } from '../utils';

// Job type definitions
export interface EmailJobData {
  type: 'welcome' | 'password_reset' | 'subscription_confirmation' | 
        'payment_failed' | 'renewal_reminder' | 'trial_ending' | 'subscription_canceled';
  userId: string;
  subscriptionId?: string;
  token?: string;
  amount?: number;
  currency?: string;
}

export interface SubscriptionJobData {
  type: 'check_expiry' | 'process_trial_ending' | 'send_renewal_reminders' | 'cleanup_expired';
  subscriptionId?: string;
  batchSize?: number;
}

export interface WebhookRetryJobData {
  eventId: string;
  eventType: string;
  payload: unknown;
  attempt: number;
}

// Shared Redis options for Bull queues
const redisOptions = {
  maxRetriesPerRequest: 3,
  enableReadyCheck: false,
  lazyConnect: true, // Don't connect immediately
  retryStrategy(times: number) {
    if (times > 3) {
      return null; // Stop retrying
    }
    return Math.min(times * 1000, 3000);
  },
};

// Lazy-initialized queue instances
let emailQueue: Queue.Queue<EmailJobData> | null = null;
let subscriptionQueue: Queue.Queue<SubscriptionJobData> | null = null;
let webhookQueue: Queue.Queue<WebhookRetryJobData> | null = null;
let queuesInitialized = false;

// Queue event handlers
const setupQueueEvents = (queue: Queue.Queue, name: string) => {
  queue.on('error', (error) => {
    const errorMessage = error?.message || error?.toString() || '';
    // Only log non-connection errors (connection errors are expected when Redis is down)
    if (errorMessage && !errorMessage.includes('ECONNREFUSED') && !errorMessage.includes('Connection is closed')) {
      logger.error(`${name} queue error`, { error: errorMessage });
    }
  });

  queue.on('failed', (job, error) => {
    logger.error(`${name} job failed`, { 
      jobId: job.id, 
      data: job.data, 
      error: error?.message || 'Unknown error',
      attemptsMade: job.attemptsMade,
    });
  });

  queue.on('completed', (job) => {
    logger.debug(`${name} job completed`, { jobId: job.id });
  });

  queue.on('stalled', (job) => {
    logger.warn(`${name} job stalled`, { jobId: job.id });
  });

  queue.on('ready', () => {
    logger.info(`${name} queue connected to Redis`);
  });
};

/**
 * Initialize queues lazily - call this before using any queue
 */
export const initializeQueues = (): boolean => {
  if (queuesInitialized) return true;
  
  try {
    emailQueue = new Queue<EmailJobData>('email', config.redis.url, {
      redis: redisOptions,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: 100,
        removeOnFail: 500,
      },
    });

    subscriptionQueue = new Queue<SubscriptionJobData>('subscription', config.redis.url, {
      redis: redisOptions,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 10000 },
        removeOnComplete: 50,
        removeOnFail: 200,
      },
    });

    webhookQueue = new Queue<WebhookRetryJobData>('webhook-retry', config.redis.url, {
      redis: redisOptions,
      defaultJobOptions: {
        attempts: 5,
        backoff: { type: 'exponential', delay: 60000 },
        removeOnComplete: 20,
        removeOnFail: 100,
      },
    });

    setupQueueEvents(emailQueue, 'Email');
    setupQueueEvents(subscriptionQueue, 'Subscription');
    setupQueueEvents(webhookQueue, 'Webhook');

    queuesInitialized = true;
    logger.info('Job queues initialized');
    return true;
  } catch (error) {
    logger.warn('Failed to initialize job queues', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return false;
  }
};

// Queue helpers - these will silently fail if queues aren't initialized
export const addEmailJob = async (
  data: EmailJobData, 
  options?: JobOptions
): Promise<Job<EmailJobData> | null> => {
  if (!emailQueue) {
    logger.warn('Email queue not available, job not added');
    return null;
  }
  try {
    const job = await emailQueue.add(data, options);
    logger.info('Email job added', { jobId: job.id, type: data.type });
    return job;
  } catch (error) {
    logger.warn('Failed to add email job', { error: error instanceof Error ? error.message : 'Unknown' });
    return null;
  }
};

export const addSubscriptionJob = async (
  data: SubscriptionJobData, 
  options?: JobOptions
): Promise<Job<SubscriptionJobData> | null> => {
  if (!subscriptionQueue) {
    logger.warn('Subscription queue not available, job not added');
    return null;
  }
  try {
    const job = await subscriptionQueue.add(data, options);
    logger.info('Subscription job added', { jobId: job.id, type: data.type });
    return job;
  } catch (error) {
    logger.warn('Failed to add subscription job', { error: error instanceof Error ? error.message : 'Unknown' });
    return null;
  }
};

export const addWebhookRetryJob = async (
  data: WebhookRetryJobData, 
  options?: JobOptions
): Promise<Job<WebhookRetryJobData> | null> => {
  if (!webhookQueue) {
    logger.warn('Webhook queue not available, job not added');
    return null;
  }
  try {
    const job = await webhookQueue.add(data, options);
    logger.info('Webhook retry job added', { jobId: job.id, eventId: data.eventId });
    return job;
  } catch (error) {
    logger.warn('Failed to add webhook job', { error: error instanceof Error ? error.message : 'Unknown' });
    return null;
  }
};

// Schedule recurring jobs
export const scheduleRecurringJobs = async (): Promise<void> => {
  if (!subscriptionQueue) {
    logger.warn('Subscription queue not available, recurring jobs not scheduled');
    return;
  }

  try {
    // Check for expiring subscriptions every hour
    await subscriptionQueue.add(
      { type: 'check_expiry' },
      { 
        repeat: { cron: '0 * * * *' },
        jobId: 'check-expiry-hourly',
      }
    );

    // Send renewal reminders daily at 9 AM
    await subscriptionQueue.add(
      { type: 'send_renewal_reminders' },
      { 
        repeat: { cron: '0 9 * * *' },
        jobId: 'renewal-reminders-daily',
      }
    );

    // Process trial ending notifications daily
    await subscriptionQueue.add(
      { type: 'process_trial_ending' },
      { 
        repeat: { cron: '0 10 * * *' },
        jobId: 'trial-ending-daily',
      }
    );

    // Cleanup expired subscriptions weekly
    await subscriptionQueue.add(
      { type: 'cleanup_expired' },
      { 
        repeat: { cron: '0 2 * * 0' },
        jobId: 'cleanup-expired-weekly',
      }
    );

    logger.info('Recurring jobs scheduled');
  } catch (error) {
    logger.warn('Failed to schedule recurring jobs', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Graceful shutdown
export const closeQueues = async (): Promise<void> => {
  try {
    const closePromises: Promise<void>[] = [];
    if (emailQueue) closePromises.push(emailQueue.close());
    if (subscriptionQueue) closePromises.push(subscriptionQueue.close());
    if (webhookQueue) closePromises.push(webhookQueue.close());
    
    if (closePromises.length > 0) {
      await Promise.all(closePromises);
      logger.info('All queues closed');
    }
  } catch (error) {
    logger.warn('Error closing queues', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Export getters for queues (may be null)
export const getEmailQueue = () => emailQueue;
export const getSubscriptionQueue = () => subscriptionQueue;
export const getWebhookQueue = () => webhookQueue;
