import { app } from './app';
import { config } from './config';
import { connectDatabase, disconnectDatabase } from './config/database';
import { disconnectRedis } from './config/redis';
import { initializeJobs, shutdownJobs } from './jobs';
import { logger } from './utils';

// ============================================
// GLOBAL EXCEPTION HANDLERS
// Register FIRST before any async operations
// ============================================

process.on('unhandledRejection', (reason, promise) => {
    logger.error('⚠️ Unhandled Promise Rejection', {
        reason: reason instanceof Error ? reason.message : String(reason),
        stack: reason instanceof Error ? reason.stack : undefined,
    });
    // Don't exit - log and continue (graceful degradation)
});

process.on('uncaughtException', (error) => {
    logger.error('💥 Uncaught Exception', {
        error: error.message,
        stack: error.stack,
    });

    // Only exit on truly fatal errors (port in use, etc.)
    if (error.message.includes('EADDRINUSE')) {
        logger.error('Port is already in use. Exiting...');
        process.exit(1);
    }
    // Other errors - log but continue
});

// ============================================
// SERVER STARTUP
// ============================================

async function startServer(): Promise<void> {
    logger.info('🚀 Starting SubsFlow Backend Server...');
    logger.info(`📝 Environment: ${config.env}`);
    logger.info(`🌐 Port: ${config.port}`);

    try {
        // Connect to MongoDB with retry logic
        logger.info('📦 Connecting to MongoDB...');
        await connectDatabase();
        logger.info('✅ MongoDB connected');

        // Initialize job system (optional - continues even if fails)
        try {
            logger.info('⚙️ Initializing job system...');
            await initializeJobs();
            logger.info('✅ Job system initialized');
        } catch (jobError) {
            logger.warn('⚠️ Job system initialization failed, continuing without background jobs', {
                error: jobError instanceof Error ? jobError.message : 'Unknown error',
            });
        }

        // Start Express server
        const server = app.listen(config.port, () => {
            logger.info('═══════════════════════════════════════════');
            logger.info(`✅ Server running on http://localhost:${config.port}`);
            logger.info(`📍 API:    http://localhost:${config.port}/api`);
            logger.info(`❤️ Health: http://localhost:${config.port}/health`);
            logger.info('═══════════════════════════════════════════');
        });

        // Server error handling
        server.on('error', (error: NodeJS.ErrnoException) => {
            if (error.code === 'EADDRINUSE') {
                logger.error(`❌ Port ${config.port} is already in use`);
                process.exit(1);
            }
            logger.error('Server error', { error: error.message });
        });

        // Keep-alive timeout (for reverse proxy compatibility)
        server.keepAliveTimeout = 65000; // 65 seconds (slightly more than ALB default)
        server.headersTimeout = 66000; // 66 seconds

        // ============================================
        // GRACEFUL SHUTDOWN
        // ============================================

        const gracefulShutdown = async (signal: string) => {
            logger.info(`\n${signal} received. Starting graceful shutdown...`);

            // Set shutdown timeout (30 seconds)
            const shutdownTimeout = setTimeout(() => {
                logger.error('⚠️ Forced shutdown after 30s timeout');
                process.exit(1);
            }, 30000);

            // Stop accepting new connections
            server.close(async () => {
                logger.info('🔌 HTTP server closed');

                try {
                    // Shutdown in order: Jobs -> Database -> Redis
                    logger.info('⏳ Shutting down background jobs...');
                    await shutdownJobs();

                    logger.info('⏳ Closing database connection...');
                    await disconnectDatabase();

                    logger.info('⏳ Closing Redis connection...');
                    await disconnectRedis();

                    clearTimeout(shutdownTimeout);
                    logger.info('✅ All connections closed. Exiting gracefully.');
                    process.exit(0);
                } catch (error) {
                    logger.error('Error during shutdown', {
                        error: error instanceof Error ? error.message : 'Unknown error',
                    });
                    process.exit(1);
                }
            });
        };

        // Register shutdown handlers
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    } catch (error) {
        logger.error('❌ Failed to start server', {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
        });

        // Wait for logs to flush before exiting
        setTimeout(() => process.exit(1), 1000);
    }
}

// Start the server
startServer();
