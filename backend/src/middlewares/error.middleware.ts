import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { 
  AppError, 
  ValidationError, 
  NotFoundError, 
  AuthenticationError, 
  AuthorizationError, 
  ConflictError,
  RateLimitError,
  StripeError,
  logger 
} from '../utils';
import { ApiResponse } from '../types';
import { config } from '../config';
import { ZodError } from 'zod';

/**
 * Map error types to HTTP status codes
 */
function getStatusCode(error: Error): number {
  if (error instanceof ValidationError) return StatusCodes.BAD_REQUEST;
  if (error instanceof NotFoundError) return StatusCodes.NOT_FOUND;
  if (error instanceof AuthenticationError) return StatusCodes.UNAUTHORIZED;
  if (error instanceof AuthorizationError) return StatusCodes.FORBIDDEN;
  if (error instanceof ConflictError) return StatusCodes.CONFLICT;
  if (error instanceof RateLimitError) return StatusCodes.TOO_MANY_REQUESTS;
  if (error instanceof StripeError) return StatusCodes.BAD_REQUEST;
  if (error instanceof ZodError) return StatusCodes.BAD_REQUEST;
  if (error instanceof AppError) return error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  return StatusCodes.INTERNAL_SERVER_ERROR;
}

/**
 * Map error types to error codes
 */
function getErrorCode(error: Error): string {
  if (error instanceof ValidationError) return 'VALIDATION_ERROR';
  if (error instanceof NotFoundError) return 'NOT_FOUND';
  if (error instanceof AuthenticationError) return 'AUTHENTICATION_ERROR';
  if (error instanceof AuthorizationError) return 'AUTHORIZATION_ERROR';
  if (error instanceof ConflictError) return 'CONFLICT';
  if (error instanceof RateLimitError) return 'RATE_LIMIT_EXCEEDED';
  if (error instanceof StripeError) return 'STRIPE_ERROR';
  if (error instanceof ZodError) return 'VALIDATION_ERROR';
  if (error instanceof AppError) return error.code || 'APP_ERROR';
  return 'INTERNAL_ERROR';
}

/**
 * Format Zod validation errors
 */
function formatZodError(error: ZodError): { field: string; message: string }[] {
  return error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
  }));
}

/**
 * Global error handler middleware
 */
export function errorHandler(
  error: Error, 
  req: Request, 
  res: Response, 
  _next: NextFunction
): void {
  const requestId = (req as any).requestId || 'unknown';
  const statusCode = getStatusCode(error);
  const errorCode = getErrorCode(error);
  const isOperational = error instanceof AppError ? error.isOperational : false;

  // Log error with context
  const logContext = {
    requestId,
    method: req.method,
    path: req.path,
    statusCode,
    errorCode,
    userId: req.userId,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    stack: error.stack,
  };

  if (statusCode >= 500) {
    logger.error('Server error', { ...logContext, error: error.message });
  } else if (statusCode >= 400) {
    logger.warn('Client error', { ...logContext, error: error.message });
  }

  // Build response
  const response: ApiResponse = {
    success: false,
    error: {
      code: errorCode,
      message: error.message,
      requestId,
    },
  };

  // Add validation details for Zod errors
  if (error instanceof ZodError) {
    response.error!.details = formatZodError(error);
  }

  // Include stack trace in development
  if (config.env === 'development' && !isOperational) {
    (response.error as any).stack = error.stack;
  }

  res.status(statusCode).json(response);
}

/**
 * 404 handler for unmatched routes
 */
export function notFoundHandler(req: Request, res: Response): void {
  const requestId = (req as any).requestId || 'unknown';
  
  logger.warn('Route not found', {
    requestId,
    method: req.method,
    path: req.path,
    ip: req.ip,
  });

  const response: ApiResponse = {
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
      requestId,
    },
  };

  res.status(StatusCodes.NOT_FOUND).json(response);
}

/**
 * Async handler wrapper to catch promise rejections
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
