import { app } from './app';
import { config } from './config';
import { connectDatabase, disconnectDatabase } from './config/database';
import { disconnectRedis } from './config/redis';
import { initializeJobs, shutdownJobs } from './jobs';
import { logger } from './utils';

// Register global exception handlers FIRST (before any async operations)
process.on('unhandledRejection', (reason, promise) => {
  logger.error('⚠️ Unhandled Promise Rejection', { 
    reason: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack : undefined,
  });
  // Don't exit - let the server continue running
});

process.on('uncaughtException', (error) => {
  logger.error('💥 Uncaught Exception - Server will continue', { 
    error: error.message, 
    stack: error.stack 
  });
  // Log but don't crash for non-fatal errors
  // Only exit on truly fatal errors
  if (error.message.includes('EADDRINUSE')) {
    logger.error('Port is already in use. Exiting...');
    process.exit(1);
  }
});

async function startServer(): Promise<void> {
  logger.info('🚀 Starting SubsFlow Backend Server...');
  logger.info(`Environment: ${config.env}`);
  logger.info(`Port: ${config.port}`);
  
  try {
    // Connect to MongoDB with retry logic
    logger.info('📦 Connecting to MongoDB...');
    await connectDatabase();
    
    // Initialize job system (optional - continues even if fails)
    try {
      logger.info('⚙️ Initializing job system...');
      await initializeJobs();
      logger.info('✅ Job system initialized');
    } catch (jobError) {
      logger.warn('⚠️ Job system initialization failed, continuing without background jobs', {
        error: jobError instanceof Error ? jobError.message : 'Unknown error'
      });
    }
    
    // Start Express server
    const server = app.listen(config.port, () => {
      logger.info(`✅ Server running on http://localhost:${config.port}`, {
        environment: config.env,
        port: config.port,
        apiUrl: `http://localhost:${config.port}/api`,
        healthCheck: `http://localhost:${config.port}/api/health`,
      });
    });

    // Server error handling
    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`❌ Port ${config.port} is already in use`);
        process.exit(1);
      }
      logger.error('Server error', { error: error.message });
    });

    // Graceful shutdown handler
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);
      
      // Set shutdown timeout
      const shutdownTimeout = setTimeout(() => {
        logger.error('Forced shutdown after 30s timeout');
        process.exit(1);
      }, 30000);

      server.close(async () => {
        logger.info('HTTP server closed');
        
        try {
          await shutdownJobs();
          await disconnectDatabase();
          await disconnectRedis();
          clearTimeout(shutdownTimeout);
          logger.info('✅ All connections closed. Exiting gracefully.');
          process.exit(0);
        } catch (error) {
          logger.error('Error during shutdown', { 
            error: error instanceof Error ? error.message : 'Unknown error' 
          });
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('❌ Failed to start server', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    // Wait a bit before exiting to allow logs to flush
    setTimeout(() => process.exit(1), 1000);
  }
}

// Start the server
startServer();
