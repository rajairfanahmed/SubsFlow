import mongoose from 'mongoose';
import { config } from '../config';
import { logger } from '../utils';

/**
 * Database migration runner
 * Executes migrations in order and tracks applied migrations
 */

interface Migration {
  name: string;
  version: string;
  up: () => Promise<void>;
  down: () => Promise<void>;
}

// Migration tracking schema
const migrationSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  version: { type: String, required: true },
  appliedAt: { type: Date, default: Date.now },
});

const MigrationModel = mongoose.model('Migration', migrationSchema);

// Define migrations
const migrations: Migration[] = [
  {
    name: '001_add_indexes',
    version: '1.0.0',
    up: async () => {
      // Add indexes for performance
      const db = mongoose.connection.db;
      if (!db) throw new Error('Database not connected');
      
      // Users collection indexes
      await db.collection('users').createIndex({ email: 1 }, { unique: true });
      await db.collection('users').createIndex({ stripeCustomerId: 1 });
      
      // Subscriptions indexes
      await db.collection('subscriptions').createIndex({ userId: 1, status: 1 });
      await db.collection('subscriptions').createIndex({ stripeSubscriptionId: 1 });
      
      // Payments indexes
      await db.collection('payments').createIndex({ userId: 1, createdAt: -1 });
      await db.collection('payments').createIndex({ stripePaymentIntentId: 1 });
      
      logger.info('Migration 001: Added database indexes');
    },
    down: async () => {
      // Rollback logic
      logger.info('Migration 001: Rollback not implemented');
    },
  },
  {
    name: '002_add_analytics_indexes',
    version: '1.0.0',
    up: async () => {
      const db = mongoose.connection.db;
      if (!db) throw new Error('Database not connected');
      
      // Analytics event indexes
      await db.collection('analyticsevents').createIndex({ eventType: 1, timestamp: -1 });
      await db.collection('analyticsevents').createIndex({ userId: 1, eventType: 1 });
      
      // Content access indexes
      await db.collection('contentaccesses').createIndex({ userId: 1, createdAt: -1 });
      await db.collection('contentaccesses').createIndex({ contentId: 1, createdAt: -1 });
      
      logger.info('Migration 002: Added analytics indexes');
    },
    down: async () => {
      logger.info('Migration 002: Rollback not implemented');
    },
  },
];

async function runMigrations() {
  try {
    await mongoose.connect(config.mongodb.uri);
    logger.info('Connected to MongoDB for migrations');

    for (const migration of migrations) {
      const applied = await MigrationModel.findOne({ name: migration.name });
      
      if (!applied) {
        logger.info(`Running migration: ${migration.name}`);
        await migration.up();
        await MigrationModel.create({
          name: migration.name,
          version: migration.version,
        });
        logger.info(`Migration completed: ${migration.name}`);
      } else {
        logger.info(`Migration already applied: ${migration.name}`);
      }
    }

    logger.info('All migrations completed');
  } catch (error) {
    logger.error('Migration failed', { error });
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

// Run migrations
runMigrations();
