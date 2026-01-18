import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import 'express-async-errors';

import { config } from './config';
import { logger, AppError, generateRequestId, ApiResponse } from './utils';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';

// Extend Express Request type
declare global {
    namespace Express {
        interface Request {
            requestId: string;
            userId?: string;
            userRole?: string;
        }
    }
}

const app: Application = express();

// ============================================
// SECURITY CONFIGURATION
// ============================================

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Request ID middleware (must be first)
app.use((req: Request, _res: Response, next: NextFunction) => {
    req.requestId = generateRequestId();
    next();
});

// Helmet - Security Headers (Strict Configuration)
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", 'js.stripe.com'],
                frameSrc: ["'self'", 'js.stripe.com', 'hooks.stripe.com'],
                imgSrc: ["'self'", 'data:', 'https:'],
                styleSrc: ["'self'", "'unsafe-inline'"],
                fontSrc: ["'self'", 'https://fonts.gstatic.com'],
                connectSrc: ["'self'", 'api.stripe.com'],
            },
        },
        hsts: {
            maxAge: 31536000, // 1 year
            includeSubDomains: true,
            preload: true,
        },
        referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
        crossOriginEmbedderPolicy: false, // Disable for Stripe iframe
        crossOriginOpenerPolicy: { policy: 'same-origin' },
        crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
);

// CORS - Strict Configuration with Credentials
const allowedOrigins = [
    config.app.frontendUrl,
    'http://localhost:3000',
    'http://localhost:5173',
];

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (mobile apps, curl, etc.)
            if (!origin) return callback(null, true);

            if (allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                logger.warn('CORS blocked request from:', { origin });
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true, // Allow cookies/auth headers
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'X-CSRF-Token'],
        exposedHeaders: ['X-Request-ID', 'X-RateLimit-Remaining'],
        maxAge: 86400, // Cache preflight for 24 hours
    })
);

// Compression
app.use(compression());

// Rate Limiting (skip for webhooks)
const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    message: ApiResponse.rateLimited('Too many requests, please try again later'),
    skip: (req) => req.path.startsWith('/api/webhooks'),
    keyGenerator: (req) => req.ip || 'unknown',
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false,
});
app.use('/api', limiter);

// ============================================
// BODY PARSING
// ============================================

// Raw body for Stripe webhooks (MUST be before json parser)
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));

// JSON and URL-encoded body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// REQUEST LOGGING
// ============================================

app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        const logLevel = res.statusCode >= 400 ? 'warn' : 'http';

        logger[logLevel](`${req.method} ${req.path}`, {
            requestId: req.requestId,
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get('user-agent'),
        });
    });

    next();
});

// ============================================
// HEALTH CHECK ENDPOINTS
// ============================================

app.get('/health', (_req: Request, res: Response) => {
    const response = ApiResponse.success(
        {
            status: 'ok',
            timestamp: new Date().toISOString(),
            version: process.env.npm_package_version || '1.0.0',
        },
        'Service is healthy'
    );
    res.status(200).json(response);
});

app.get('/health/ready', async (_req: Request, res: Response) => {
    const response = ApiResponse.success(
        {
            status: 'ok',
            timestamp: new Date().toISOString(),
            services: {
                api: 'healthy',
            },
        },
        'Service is ready'
    );
    res.status(200).json(response);
});

// ============================================
// API ROUTES
// ============================================

import { apiRoutes } from './routes';
app.use('/api', apiRoutes);

// ============================================
// ERROR HANDLING
// ============================================

// 404 Not Found Handler
app.use(notFoundHandler);

// Global Error Handler (must be last)
app.use(errorHandler);

export { app };
