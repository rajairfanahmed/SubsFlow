import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ZodError } from 'zod';
import { MongoError } from 'mongodb';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { config } from '../config';
import { logger } from '../utils/logger';
import { ApiResponse } from '../utils/ApiResponse';
import {
    AppError,
    ValidationError,
    NotFoundError,
    AuthenticationError,
    AuthorizationError,
    ConflictError,
    RateLimitError,
} from '../utils/errors';

/**
 * MongoDB Duplicate Key Error Code
 */
const MONGO_DUPLICATE_KEY_CODE = 11000;

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
    if (error instanceof ZodError) return StatusCodes.BAD_REQUEST;
    if (error instanceof JsonWebTokenError) return StatusCodes.UNAUTHORIZED;
    if (error instanceof TokenExpiredError) return StatusCodes.UNAUTHORIZED;
    if ((error as any).code === MONGO_DUPLICATE_KEY_CODE) return StatusCodes.CONFLICT;
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
    if (error instanceof ZodError) return 'VALIDATION_ERROR';
    if (error instanceof JsonWebTokenError) return 'INVALID_TOKEN';
    if (error instanceof TokenExpiredError) return 'TOKEN_EXPIRED';
    if ((error as any).code === MONGO_DUPLICATE_KEY_CODE) return 'DUPLICATE_KEY';
    if (error instanceof AppError) return error.code || 'APP_ERROR';
    return 'INTERNAL_ERROR';
}

/**
 * Format Zod validation errors into clean array
 */
function formatZodError(error: ZodError): { field: string; message: string }[] {
    return error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
    }));
}

/**
 * Extract duplicate key field from MongoDB error
 */
function extractDuplicateKey(error: MongoError & { keyValue?: Record<string, unknown> }): string | undefined {
    if (error.keyValue) {
        return Object.keys(error.keyValue)[0];
    }
    return undefined;
}

/**
 * Get user-friendly message for error
 */
function getErrorMessage(error: Error): string {
    // Never expose internal error details in production
    const isProduction = config.env === 'production';

    // Handle specific error types
    if (error instanceof ZodError) {
        return 'Validation failed. Please check your input.';
    }

    if (error instanceof JsonWebTokenError) {
        return 'Invalid authentication token.';
    }

    if (error instanceof TokenExpiredError) {
        return 'Authentication token has expired. Please log in again.';
    }

    // MongoDB duplicate key
    if ((error as any).code === MONGO_DUPLICATE_KEY_CODE) {
        const field = extractDuplicateKey(error as any);
        return field ? `A record with this ${field} already exists.` : 'A duplicate record already exists.';
    }

    // Known app errors - safe to show message
    if (error instanceof AppError) {
        return error.message;
    }

    // Unknown errors in production - hide details
    if (isProduction) {
        return 'An unexpected error occurred. Please try again later.';
    }

    return error.message;
}

/**
 * Global Error Handler Middleware
 * Catches all errors and returns standardized ApiResponse format.
 */
export function errorHandler(
    error: Error,
    req: Request,
    res: Response,
    _next: NextFunction
): void {
    const requestId = req.requestId || 'unknown';
    const statusCode = getStatusCode(error);
    const errorCode = getErrorCode(error);
    const isOperational = error instanceof AppError ? error.isOperational : false;

    // Build log context
    const logContext = {
        requestId,
        method: req.method,
        path: req.path,
        statusCode,
        errorCode,
        userId: req.userId,
        ip: req.ip,
        userAgent: req.get('user-agent'),
    };

    // Log based on severity
    if (statusCode >= 500) {
        logger.error('Server error', {
            ...logContext,
            error: error.message,
            stack: error.stack,
        });
    } else if (statusCode >= 400) {
        logger.warn('Client error', {
            ...logContext,
            error: error.message,
        });
    }

    // Build response details
    let details: unknown = undefined;

    // Add Zod validation details
    if (error instanceof ZodError) {
        details = formatZodError(error);
    }

    // Add duplicate key field
    if ((error as any).code === MONGO_DUPLICATE_KEY_CODE) {
        const field = extractDuplicateKey(error as any);
        if (field) {
            details = { field };
        }
    }

    // Add stack trace in development for non-operational errors
    if (config.env === 'development' && !isOperational) {
        details = {
            ...(typeof details === 'object' ? details : {}),
            stack: error.stack,
        };
    }

    // Send standardized response
    const message = getErrorMessage(error);
    const response = ApiResponse.error(message, statusCode, errorCode, details, requestId);
    res.status(statusCode).json(response);
}

/**
 * 404 Not Found Handler
 */
export function notFoundHandler(req: Request, res: Response): void {
    const requestId = req.requestId || 'unknown';

    logger.warn('Route not found', {
        requestId,
        method: req.method,
        path: req.path,
        ip: req.ip,
    });

    const response = ApiResponse.notFound(
        `Route ${req.method} ${req.path} not found`,
        requestId
    );
    res.status(StatusCodes.NOT_FOUND).json(response);
}

/**
 * Async Handler Wrapper
 * Wraps async route handlers to catch promise rejections.
 */
export function asyncHandler(
    fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
    return (req: Request, res: Response, next: NextFunction): void => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
