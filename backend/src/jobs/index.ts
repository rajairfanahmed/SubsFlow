export * from './queues';
export { processEmailJobs } from './email.processor';
export { processSubscriptionJobs } from './subscription.processor';

import { processEmailJobs } from './email.processor';
import { processSubscriptionJobs } from './subscription.processor';
import { scheduleRecurringJobs, closeQueues, initializeQueues } from './queues';
import { logger } from '../utils';

/**
 * Initialize all job processors and schedule recurring jobs
 * This is completely non-blocking - server will work without Redis
 */
export const initializeJobs = async (): Promise<void> => {
  try {
    // Initialize queues first (this may fail if Redis is down)
    const queuesReady = initializeQueues();
    if (!queuesReady) {
      logger.warn('Queues not initialized, skipping job processors');
      return;
    }

    // Start processors (wrapped - won't throw)
    try {
      processEmailJobs();
      logger.info('Email job processor started');
    } catch (err) {
      logger.warn('Email processor failed to start', { error: err instanceof Error ? err.message : 'Unknown' });
    }
    
    try {
      processSubscriptionJobs();
      logger.info('Subscription job processor started');
    } catch (err) {
      logger.warn('Subscription processor failed to start', { error: err instanceof Error ? err.message : 'Unknown' });
    }
    
    // Schedule recurring jobs (wrapped - won't throw)
    try {
      await scheduleRecurringJobs();
      logger.info('Recurring jobs scheduled');
    } catch (err) {
      logger.warn('Failed to schedule recurring jobs', { error: err instanceof Error ? err.message : 'Unknown' });
    }
    
    logger.info('Job system initialization complete');
  } catch (error) {
    logger.warn('Job system initialization failed, continuing without background jobs', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    // Don't throw - server should continue without jobs
  }
};

/**
 * Gracefully shutdown job system
 */
export const shutdownJobs = async (): Promise<void> => {
  try {
    await closeQueues();
    logger.info('Job system shutdown complete');
  } catch (error) {
    logger.warn('Job system shutdown had errors', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};


