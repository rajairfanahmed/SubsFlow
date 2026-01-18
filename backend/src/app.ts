import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import 'express-async-errors';

import { config } from './config';
import { logger, AppError, generateRequestId } from './utils';

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

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Request ID middleware (must be first)
app.use((req: Request, _res: Response, next: NextFunction) => {
  req.requestId = generateRequestId();
  next();
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "js.stripe.com"],
      frameSrc: ["'self'", "js.stripe.com"],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true },
}));

// CORS
app.use(cors({
  origin: [config.app.frontendUrl, 'http://localhost:5173', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
}));

// Compression
app.use(compression());

// Rate limiting (skip for webhooks)
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_ERROR',
      message: 'Too many requests, please try again later',
    },
  },
  skip: (req) => req.path.startsWith('/api/webhooks'),
  keyGenerator: (req) => req.ip || 'unknown',
});
app.use('/api', limiter);

// Body parsing - IMPORTANT: Raw body for Stripe webhooks
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.http(`${req.method} ${req.path}`, {
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

// Health check endpoints
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/health/ready', async (_req: Request, res: Response) => {
  // Will add DB and Redis checks when routes are set up
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      api: 'healthy',
    },
  });
});

// API Routes
import { apiRoutes } from './routes';
app.use('/api', apiRoutes);

// 404 handler
app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(new AppError('Route not found', 404, 'NOT_FOUND'));
});

// Global error handler
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  const requestId = req.requestId;
  
  if (err instanceof AppError) {
    logger.warn('Operational error', {
      requestId,
      code: err.code,
      message: err.message,
      statusCode: err.statusCode,
      path: req.path,
    });
    
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
        requestId,
      },
    });
  }
  
  // Unexpected error
  logger.error('Unexpected error', {
    requestId,
    message: err.message,
    stack: err.stack,
    path: req.path,
  });
  
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: config.env === 'production' 
        ? 'An unexpected error occurred' 
        : err.message,
      requestId,
    },
  });
});

export { app };
