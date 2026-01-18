import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { AuthenticationError, AuthorizationError } from '../utils';
import { UserRole } from '../types';

/**
 * Authentication middleware - validates JWT and sets user on request
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided');
    }

    const token = authHeader.substring(7);
    const decoded = authService.verifyAccessToken(token);

    // Set user info on request
    req.userId = decoded.userId;
    req.userRole = decoded.role;

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Optional authentication - doesn't fail if no token, just sets user if valid
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = authService.verifyAccessToken(token);
        req.userId = decoded.userId;
        req.userRole = decoded.role;
      } catch {
        // Token invalid, but that's okay for optional auth
      }
    }

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Authorization middleware factory - checks if user has required role
 */
export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.userId || !req.userRole) {
      next(new AuthenticationError('Authentication required'));
      return;
    }

    if (!allowedRoles.includes(req.userRole as UserRole)) {
      next(new AuthorizationError(`Required role: ${allowedRoles.join(' or ')}`));
      return;
    }

    next();
  };
}

/**
 * Check if user is admin
 */
export const isAdmin = authorize('admin');

/**
 * Check if user is content manager or admin
 */
export const isContentManager = authorize('content_manager', 'admin');
