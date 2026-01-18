import { StatusCodes } from 'http-status-codes';

export interface AppErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
    requestId?: string;
  };
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true,
    details?: unknown
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.details = details;
    
    Error.captureStackTrace(this, this.constructor);
    Object.setPrototypeOf(this, AppError.prototype);
  }

  toJSON(): AppErrorResponse {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
      },
    };
  }
}

// Validation Error (400)
export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, StatusCodes.BAD_REQUEST, 'VALIDATION_ERROR', true, details);
  }
}

// Authentication Error (401)
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, StatusCodes.UNAUTHORIZED, 'AUTHENTICATION_ERROR', true);
  }
}

// Authorization Error (403)
export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, StatusCodes.FORBIDDEN, 'AUTHORIZATION_ERROR', true);
  }
}

// Not Found Error (404)
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, StatusCodes.NOT_FOUND, 'NOT_FOUND', true);
  }
}

// Conflict Error (409)
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, StatusCodes.CONFLICT, 'CONFLICT_ERROR', true);
  }
}

// Rate Limit Error (429)
export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, StatusCodes.TOO_MANY_REQUESTS, 'RATE_LIMIT_ERROR', true);
  }
}

// Payment Error (402)
export class PaymentError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, StatusCodes.PAYMENT_REQUIRED, 'PAYMENT_ERROR', true, details);
  }
}

// Stripe Error (502)
export class StripeError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, StatusCodes.BAD_GATEWAY, 'STRIPE_ERROR', true, details);
  }
}

// Database Error (500)
export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed') {
    super(message, StatusCodes.INTERNAL_SERVER_ERROR, 'DATABASE_ERROR', false);
  }
}
