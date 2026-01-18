import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { userService } from '../services/user.service';
import { ApiResponse } from '../types';

export class UserController {
  // ============================================
  // User Profile Methods (for authenticated user)
  // ============================================

  /**
   * GET /users/me
   * Get current user's profile
   */
  async getMyProfile(req: Request, res: Response): Promise<void> {
    const user = await userService.getById(req.userId!);

    const response: ApiResponse = {
      success: true,
      data: user,
    };

    res.status(StatusCodes.OK).json(response);
  }

  /**
   * PATCH /users/me
   * Update current user's profile
   */
  async updateMyProfile(req: Request, res: Response): Promise<void> {
    // Only allow certain fields to be updated by user
    const { name, avatar } = req.body;
    const allowedUpdates = { name, avatar };

    const user = await userService.update(req.userId!, allowedUpdates);

    const response: ApiResponse = {
      success: true,
      data: user,
    };

    res.status(StatusCodes.OK).json(response);
  }

  /**
   * GET /users/me/stats
   * Get current user's statistics
   */
  async getMyStats(req: Request, res: Response): Promise<void> {
    const stats = await userService.getStats(req.userId!);

    const response: ApiResponse = {
      success: true,
      data: stats,
    };

    res.status(StatusCodes.OK).json(response);
  }

  // ============================================
  // Admin Methods
  // ============================================

  /**
   * GET /users
   * List/search users (admin only)
   */
  async listUsers(req: Request, res: Response): Promise<void> {
    const { search, role, status, page, limit, sortBy, sortOrder } = req.query;

    const result = await userService.search({
      search: search as string,
      role: role as any,
      status: status as any,
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc',
    });

    const response: ApiResponse = {
      success: true,
      data: result,
    };

    res.status(StatusCodes.OK).json(response);
  }

  /**
   * GET /users/:userId
   * Get user by ID (admin only)
   */
  async getUser(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;
    
    if (!userId) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'User ID required' }
      });
      return;
    }

    const user = await userService.getById(userId);

    const response: ApiResponse = {
      success: true,
      data: { user },
    };

    res.status(StatusCodes.OK).json(response);
  }

  /**
   * POST /users
   * Create user (admin only)
   */
  async createUser(req: Request, res: Response): Promise<void> {
    const user = await userService.create(req.body);

    const response: ApiResponse = {
      success: true,
      data: { user },
    };

    res.status(StatusCodes.CREATED).json(response);
  }

  /**
   * PATCH /users/:userId
   * Update user (admin only)
   */
  async updateUser(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;
    
    if (!userId) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'User ID required' }
      });
      return;
    }

    const user = await userService.update(userId, req.body);

    const response: ApiResponse = {
      success: true,
      data: { user },
    };

    res.status(StatusCodes.OK).json(response);
  }

  /**
   * POST /users/:userId/suspend
   * Suspend user (admin only)
   */
  async suspendUser(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;
    
    if (!userId) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'User ID required' }
      });
      return;
    }

    const user = await userService.suspend(userId);

    const response: ApiResponse = {
      success: true,
      data: { user, message: 'User suspended' },
    };

    res.status(StatusCodes.OK).json(response);
  }

  /**
   * POST /users/:userId/reactivate
   * Reactivate user (admin only)
   */
  async reactivateUser(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;
    
    if (!userId) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'User ID required' }
      });
      return;
    }

    const user = await userService.reactivate(userId);

    const response: ApiResponse = {
      success: true,
      data: { user, message: 'User reactivated' },
    };

    res.status(StatusCodes.OK).json(response);
  }

  /**
   * DELETE /users/:userId
   * Delete user (admin only)
   */
  async deleteUser(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;
    
    if (!userId) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'User ID required' }
      });
      return;
    }

    await userService.delete(userId);

    const response: ApiResponse = {
      success: true,
      data: { message: 'User deleted' },
    };

    res.status(StatusCodes.OK).json(response);
  }

  /**
   * GET /users/:userId/stats
   * Get user statistics (admin only)
   */
  async getUserStats(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;
    
    if (!userId) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'User ID required' }
      });
      return;
    }

    const stats = await userService.getStats(userId);

    const response: ApiResponse = {
      success: true,
      data: { stats },
    };

    res.status(StatusCodes.OK).json(response);
  }
}

export const userController = new UserController();
