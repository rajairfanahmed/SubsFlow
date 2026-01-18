import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils';

/**
 * Middleware to add request ID and log incoming requests
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  // Generate unique request ID
  const requestId = req.headers['x-request-id'] as string || uuidv4();
  (req as any).requestId = requestId;
  
  // Add to response headers
  res.setHeader('x-request-id', requestId);

  // Record start time
  const startTime = Date.now();

  // Log request
  logger.info('Incoming request', {
    requestId,
    method: req.method,
    path: req.path,
    query: Object.keys(req.query).length > 0 ? req.query : undefined,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Log response on finish
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const level = res.statusCode >= 400 ? 'warn' : 'info';
    
    logger[level]('Request completed', {
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: req.userId,
    });
  });

  next();
}

/**
 * Middleware to log response body (use sparingly, for debugging)
 */
export function responseLogger(req: Request, res: Response, next: NextFunction): void {
  const originalJson = res.json.bind(res);
  
  res.json = function(body: any): Response {
    const requestId = (req as any).requestId;
    
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      logger.debug('Response body', {
        requestId,
        body: typeof body === 'object' ? JSON.stringify(body).substring(0, 500) : body,
      });
    }
    
    return originalJson(body);
  };

  next();
}
