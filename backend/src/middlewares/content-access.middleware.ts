import { Request, Response, NextFunction } from 'express';
import { Subscription, Content } from '../models';
import { AuthorizationError, NotFoundError } from '../utils';

/**
 * Middleware to check if user has access to content based on subscription tier
 */
export function requireContentAccess(contentIdParam: string = 'contentId') {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const contentId = req.params[contentIdParam];
      if (!contentId) {
        next(new NotFoundError('Content ID'));
        return;
      }

      // Get content
      const content = await Content.findById(contentId);
      if (!content) {
        next(new NotFoundError('Content'));
        return;
      }

      // Free content (tier 0) is accessible to everyone
      if (content.requiredTier === 0) {
        (req as any).content = content;
        next();
        return;
      }

      // Must be authenticated for paid content
      if (!req.userId) {
        next(new AuthorizationError('Authentication required to access this content'));
        return;
      }

      // Admins have unrestricted access
      if (req.userRole === 'admin') {
        (req as any).content = content;
        next();
        return;
      }

      // Get user's active subscription
      const subscription = await Subscription.findOne({
        userId: req.userId,
        status: { $in: ['active', 'trialing'] },
      }).populate('planId');

      if (!subscription) {
        next(new AuthorizationError('Active subscription required to access this content'));
        return;
      }

      // Check if subscription period is still valid
      if (new Date() > subscription.currentPeriodEnd) {
        next(new AuthorizationError('Subscription expired. Please renew to access this content'));
        return;
      }

      // Compare tier levels
      const plan = subscription.planId as any;
      const userTier = plan?.tierLevel ?? 0;
      if (userTier < content.requiredTier) {
        next(new AuthorizationError(
          `Upgrade required. This content requires tier ${content.requiredTier}, you have tier ${userTier}`
        ));
        return;
      }

      // Access granted
      (req as any).content = content;
      (req as any).subscription = subscription;
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Middleware to check minimum subscription tier
 */
export function requireSubscriptionTier(minTier: number) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.userId) {
        next(new AuthorizationError('Authentication required'));
        return;
      }

      // Admins bypass tier check
      if (req.userRole === 'admin') {
        next();
        return;
      }

      const subscription = await Subscription.findOne({
        userId: req.userId,
        status: { $in: ['active', 'trialing'] },
      }).populate('planId');

      if (!subscription) {
        next(new AuthorizationError('Active subscription required'));
        return;
      }

      const plan = subscription.planId as any;
      const userTier = plan?.tierLevel ?? 0;
      if (userTier < minTier) {
        next(new AuthorizationError(`Tier ${minTier} subscription required`));
        return;
      }

      (req as any).subscription = subscription;
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Middleware to check if user has any active subscription
 */
export function requireActiveSubscription(req: Request, res: Response, next: NextFunction): void {
  requireSubscriptionTier(1)(req, res, next);
}
