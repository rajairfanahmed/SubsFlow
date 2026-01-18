import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { stripeService } from '../services/stripe.service';
import { ApiResponse } from '../types';

export class StripeController {
  /**
   * POST /billing/checkout-session
   */
  async createCheckoutSession(req: Request, res: Response): Promise<void> {
    const { priceId, successUrl, cancelUrl } = req.body;
    
    const session = await stripeService.createCheckoutSession(
      req.userId!,
      priceId,
      successUrl,
      cancelUrl
    );

    const response: ApiResponse = {
      success: true,
      data: { url: session.url },
    };

    res.status(StatusCodes.OK).json(response);
  }

  /**
   * POST /billing/portal-session
   */
  async createPortalSession(req: Request, res: Response): Promise<void> {
    const { returnUrl } = req.body;
    
    const session = await stripeService.createPortalSession(req.userId!, returnUrl);

    const response: ApiResponse = {
      success: true,
      data: { url: session.url },
    };

    res.status(StatusCodes.OK).json(response);
  }

  /**
   * POST /billing/cancel-subscription
   */
  async cancelSubscription(req: Request, res: Response): Promise<void> {
    const { subscriptionId, atPeriodEnd } = req.body;
    
    await stripeService.cancelSubscription(subscriptionId, atPeriodEnd);

    const response: ApiResponse = {
      success: true,
      data: { message: 'Subscription cancellation scheduled' },
    };

    res.status(StatusCodes.OK).json(response);
  }

  /**
   * POST /billing/update-subscription
   */
  async updateSubscription(req: Request, res: Response): Promise<void> {
    const { subscriptionId, newPriceId } = req.body;
    
    const subscription = await stripeService.updateSubscription(subscriptionId, newPriceId);

    const response: ApiResponse = {
      success: true,
      data: { 
        id: subscription.id,
        status: subscription.status 
      },
    };

    res.status(StatusCodes.OK).json(response);
  }
}

export const stripeController = new StripeController();
