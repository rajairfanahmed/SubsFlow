import mongoose from 'mongoose';
import { config } from './index';
import { logger } from '../utils/logger';

let isConnected = false;

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

/**
 * Connect to MongoDB with retry logic
 */
export async function connectDatabase(retries = MAX_RETRIES): Promise<void> {
  if (isConnected) {
    logger.info('Using existing database connection');
    return;
  }

  mongoose.set('strictQuery', true);
  
  // Set up event listeners once
  mongoose.connection.on('connected', () => {
    logger.info('✅ MongoDB connected successfully');
    isConnected = true;
  });

  mongoose.connection.on('error', (err) => {
    logger.error('MongoDB connection error', { error: err.message });
    isConnected = false;
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
    isConnected = false;
  });

  // Retry loop
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      logger.info(`Attempting MongoDB connection (${attempt}/${retries})...`);
      
      await mongoose.connect(config.mongodb.uri, {
        ...config.mongodb.options,
        serverSelectionTimeoutMS: 10000, // 10 second timeout
        connectTimeoutMS: 10000,
      });
      
      // Connection successful
      logger.info('MongoDB connection established');
      return;
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`MongoDB connection attempt ${attempt} failed`, { error: errorMsg });
      
      if (attempt < retries) {
        logger.info(`Retrying in ${RETRY_DELAY_MS / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      } else {
        logger.error('All MongoDB connection attempts exhausted');
        throw new Error(`Failed to connect to MongoDB after ${retries} attempts: ${errorMsg}`);
      }
    }
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (!isConnected) {
    return;
  }

  try {
    await mongoose.disconnect();
    isConnected = false;
    logger.info('MongoDB disconnected gracefully');
  } catch (error) {
    logger.error('Error disconnecting from MongoDB', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    throw error;
  }
}

export function isDatabaseConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}
