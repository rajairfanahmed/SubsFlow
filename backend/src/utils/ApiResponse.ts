import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';

/**
 * Standardized API Response Class
 * Every endpoint must use this class to ensure consistent JSON structure.
 */
export class ApiResponse<T = unknown> {
    public readonly success: boolean;
    public readonly statusCode: number;
    public readonly message: string;
    public readonly data?: T;
    public readonly error?: {
        code: string;
        message: string;
        details?: unknown;
        requestId?: string;
    };
    public readonly timestamp: string;

    private constructor(
        success: boolean,
        statusCode: number,
        message: string,
        data?: T,
        error?: ApiResponse['error']
    ) {
        this.success = success;
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.error = error;
        this.timestamp = new Date().toISOString();
    }

    /**
     * Create a success response
     */
    static success<T>(data: T, message = 'Operation successful', statusCode = StatusCodes.OK): ApiResponse<T> {
        return new ApiResponse<T>(true, statusCode, message, data);
    }

    /**
     * Create an error response
     */
    static error(
        message: string,
        statusCode = StatusCodes.INTERNAL_SERVER_ERROR,
        code = 'INTERNAL_ERROR',
        details?: unknown,
        requestId?: string
    ): ApiResponse<null> {
        return new ApiResponse<null>(
            false,
            statusCode,
            message,
            undefined,
            { code, message, details, requestId }
        );
    }

    /**
     * Send success response via Express
     */
    static sendSuccess<T>(res: Response, data: T, message = 'Operation successful', statusCode = StatusCodes.OK): void {
        const response = ApiResponse.success(data, message, statusCode);
        res.status(statusCode).json(response);
    }

    /**
     * Send error response via Express
     */
    static sendError(
        res: Response,
        message: string,
        statusCode = StatusCodes.INTERNAL_SERVER_ERROR,
        code = 'INTERNAL_ERROR',
        details?: unknown,
        requestId?: string
    ): void {
        const response = ApiResponse.error(message, statusCode, code, details, requestId);
        res.status(statusCode).json(response);
    }

    /**
     * Created (201)
     */
    static created<T>(data: T, message = 'Resource created successfully'): ApiResponse<T> {
        return new ApiResponse<T>(true, StatusCodes.CREATED, message, data);
    }

    /**
     * No Content (204) - for delete operations
     */
    static noContent(message = 'Resource deleted successfully'): ApiResponse<null> {
        return new ApiResponse<null>(true, StatusCodes.NO_CONTENT, message);
    }

    /**
     * Bad Request (400)
     */
    static badRequest(message: string, details?: unknown, requestId?: string): ApiResponse<null> {
        return ApiResponse.error(message, StatusCodes.BAD_REQUEST, 'BAD_REQUEST', details, requestId);
    }

    /**
     * Unauthorized (401)
     */
    static unauthorized(message = 'Authentication required', requestId?: string): ApiResponse<null> {
        return ApiResponse.error(message, StatusCodes.UNAUTHORIZED, 'UNAUTHORIZED', undefined, requestId);
    }

    /**
     * Forbidden (403)
     */
    static forbidden(message = 'Access denied', requestId?: string): ApiResponse<null> {
        return ApiResponse.error(message, StatusCodes.FORBIDDEN, 'FORBIDDEN', undefined, requestId);
    }

    /**
     * Not Found (404)
     */
    static notFound(message = 'Resource not found', requestId?: string): ApiResponse<null> {
        return ApiResponse.error(message, StatusCodes.NOT_FOUND, 'NOT_FOUND', undefined, requestId);
    }

    /**
     * Conflict (409)
     */
    static conflict(message: string, requestId?: string): ApiResponse<null> {
        return ApiResponse.error(message, StatusCodes.CONFLICT, 'CONFLICT', undefined, requestId);
    }

    /**
     * Validation Error (422)
     */
    static validationError(message: string, details?: unknown, requestId?: string): ApiResponse<null> {
        return ApiResponse.error(message, StatusCodes.UNPROCESSABLE_ENTITY, 'VALIDATION_ERROR', details, requestId);
    }

    /**
     * Rate Limited (429)
     */
    static rateLimited(message = 'Too many requests', requestId?: string): ApiResponse<null> {
        return ApiResponse.error(message, StatusCodes.TOO_MANY_REQUESTS, 'RATE_LIMITED', undefined, requestId);
    }

    /**
     * Internal Server Error (500)
     */
    static serverError(message = 'Internal server error', requestId?: string): ApiResponse<null> {
        return ApiResponse.error(message, StatusCodes.INTERNAL_SERVER_ERROR, 'INTERNAL_ERROR', undefined, requestId);
    }

    /**
     * Convert to JSON for response
     */
    toJSON(): Record<string, unknown> {
        const json: Record<string, unknown> = {
            success: this.success,
            statusCode: this.statusCode,
            message: this.message,
            timestamp: this.timestamp,
        };

        if (this.success && this.data !== undefined) {
            json.data = this.data;
        }

        if (!this.success && this.error) {
            json.error = this.error;
        }

        return json;
    }
}
