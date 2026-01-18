import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { authService } from '../services/auth.service';
import { ApiResponse } from '../utils/ApiResponse';
import { ValidationError } from '../utils';
import { asyncHandler } from '../middlewares/error.middleware';

export class AuthController {
    /**
     * POST /auth/register
     * STRICT: Does NOT return token. User must log in after registration.
     */
    register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { email, password, name } = req.body;

        // Input validation - fail fast before DB call
        if (!email || typeof email !== 'string' || !email.includes('@')) {
            throw new ValidationError('Valid email is required');
        }
        if (!password || typeof password !== 'string' || password.length < 8) {
            throw new ValidationError('Password must be at least 8 characters');
        }
        if (!name || typeof name !== 'string' || name.trim().length < 2) {
            throw new ValidationError('Name must be at least 2 characters');
        }

        // Register user (service handles hashing, verification email if enabled)
        const { user } = await authService.register(req.body);

        // STRICT: Return success message only - NO TOKEN
        // Frontend must redirect to /login
        const response = ApiResponse.created(
            {
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    emailVerified: user.emailVerified,
                },
            },
            'Account created successfully. Please log in.'
        );

        res.status(StatusCodes.CREATED).json(response);
    });

    /**
     * POST /auth/login
     */
    login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { email, password } = req.body;

        // Input validation - fail fast
        if (!email || typeof email !== 'string') {
            throw new ValidationError('Email is required');
        }
        if (!password || typeof password !== 'string') {
            throw new ValidationError('Password is required');
        }

        const userAgent = req.get('user-agent');
        const ipAddress = req.ip;

        const { user, tokens } = await authService.login(req.body, userAgent, ipAddress);

        const response = ApiResponse.success(
            {
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    emailVerified: user.emailVerified,
                },
                token: tokens.accessToken,
                refreshToken: tokens.refreshToken,
            },
            'Login successful'
        );

        res.status(StatusCodes.OK).json(response);
    });

    /**
     * POST /auth/refresh
     */
    refreshToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { refreshToken } = req.body;

        if (!refreshToken || typeof refreshToken !== 'string') {
            throw new ValidationError('Refresh token is required');
        }

        const tokens = await authService.refreshAccessToken(refreshToken);

        const response = ApiResponse.success(
            {
                token: tokens.accessToken,
                refreshToken: tokens.refreshToken,
            },
            'Token refreshed successfully'
        );

        res.status(StatusCodes.OK).json(response);
    });

    /**
     * POST /auth/logout
     */
    logout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { refreshToken } = req.body;

        if (refreshToken) {
            await authService.logout(refreshToken);
        }

        const response = ApiResponse.success(null, 'Logged out successfully');
        res.status(StatusCodes.OK).json(response);
    });

    /**
     * POST /auth/logout-all
     */
    logoutAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        if (!req.userId) {
            throw new ValidationError('User not authenticated');
        }

        await authService.logoutAll(req.userId);

        const response = ApiResponse.success(null, 'Logged out from all devices');
        res.status(StatusCodes.OK).json(response);
    });

    /**
     * POST /auth/forgot-password
     */
    forgotPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { email } = req.body;

        if (!email || typeof email !== 'string') {
            throw new ValidationError('Email is required');
        }

        await authService.forgotPassword(req.body);

        // Always return success to prevent email enumeration
        const response = ApiResponse.success(
            null,
            'If the email exists, a reset link has been sent'
        );
        res.status(StatusCodes.OK).json(response);
    });

    /**
     * POST /auth/reset-password
     */
    resetPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { token, password } = req.body;

        if (!token || typeof token !== 'string') {
            throw new ValidationError('Reset token is required');
        }
        if (!password || typeof password !== 'string' || password.length < 8) {
            throw new ValidationError('Password must be at least 8 characters');
        }

        await authService.resetPassword(req.body);

        const response = ApiResponse.success(null, 'Password reset successfully');
        res.status(StatusCodes.OK).json(response);
    });

    /**
     * POST /auth/verify-email
     */
    verifyEmail = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { token } = req.body;

        if (!token || typeof token !== 'string') {
            throw new ValidationError('Verification token is required');
        }

        await authService.verifyEmail(token);

        const response = ApiResponse.success(null, 'Email verified successfully');
        res.status(StatusCodes.OK).json(response);
    });

    /**
     * POST /auth/change-password
     */
    changePassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { currentPassword, newPassword } = req.body;

        if (!req.userId) {
            throw new ValidationError('User not authenticated');
        }
        if (!currentPassword || typeof currentPassword !== 'string') {
            throw new ValidationError('Current password is required');
        }
        if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
            throw new ValidationError('New password must be at least 8 characters');
        }

        await authService.changePassword(req.userId, currentPassword, newPassword);

        const response = ApiResponse.success(null, 'Password changed successfully');
        res.status(StatusCodes.OK).json(response);
    });

    /**
     * GET /auth/me - Get current user
     */
    getMe = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        if (!req.userId) {
            throw new ValidationError('User not authenticated');
        }

        // User data populated by auth middleware
        const response = ApiResponse.success(
            {
                user: {
                    id: req.userId,
                    role: req.userRole,
                },
            },
            'User retrieved successfully'
        );

        res.status(StatusCodes.OK).json(response);
    });
}

export const authController = new AuthController();
