import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { subscriptionService } from '../services/subscription.service';
import { ApiResponse } from '../types';

export class SubscriptionController {
  /**
   * GET /subscriptions/me
   * Get current user's subscription
   */
  async getMySubscription(req: Request, res: Response): Promise<void> {
    const subscription = await subscriptionService.getUserSubscription(req.userId!);

    const response: ApiResponse = {
      success: true,
      data: { subscription },
    };

    res.status(StatusCodes.OK).json(response);
  }

  /**
   * GET /subscriptions/plans
   * Get available subscription plans
   */
  async getPlans(_req: Request, res: Response): Promise<void> {
    const plans = await subscriptionService.getAvailablePlans();

    const response: ApiResponse = {
      success: true,
      data: { plans },
    };

    res.status(StatusCodes.OK).json(response);
  }

  /**
   * GET /subscriptions/access/:contentId
   * Check if user has access to specific content
   */
  async checkContentAccess(req: Request, res: Response): Promise<void> {
    const contentId = req.params.contentId;
    if (!contentId) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Content ID is required' }
      });
      return;
    }
    
    const hasAccess = await subscriptionService.checkContentAccess(req.userId!, contentId);

    const response: ApiResponse = {
      success: true,
      data: { hasAccess },
    };

    res.status(StatusCodes.OK).json(response);
  }
}

export const subscriptionController = new SubscriptionController();
