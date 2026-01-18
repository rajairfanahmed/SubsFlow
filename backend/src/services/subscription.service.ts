import { 
  Subscription, 
  Plan, 
  Content, 
  User 
} from '../models';
import { 
  NotFoundError, 
  AuthorizationError, 
  logger 
} from '../utils';
import { Types } from 'mongoose';

export class SubscriptionService {
  /**
   * Check if a user has access to a specific piece of content
   */
  async checkContentAccess(userId: string, contentId: string): Promise<boolean> {
    const content = await Content.findById(contentId);
    if (!content) throw new NotFoundError('Content');

    // Free content (tier 0)
    if (content.requiredTier === 0) return true;

    // Admins always have access
    const user = await User.findById(userId);
    if (user?.role === 'admin') return true;

    // Find user's active subscription
    const subscription = await Subscription.findOne({
      userId,
      status: { $in: ['active', 'trialing', 'past_due'] }
    }).populate('planId');

    if (!subscription) return false;

    const plan = subscription.planId as any; // Cast to access fields
    
    // Check if subscription has expired (past period end)
    if (new Date() > subscription.currentPeriodEnd) {
      return false;
    }

    // Compare tier levels
    return plan.tierLevel >= content.requiredTier;
  }

  /**
   * Get user's current subscription details with plan info
   */
  async getUserSubscription(userId: string) {
    const subscription = await Subscription.findOne({ userId })
      .populate('planId')
      .sort({ createdAt: -1 });

    return subscription;
  }

  /**
   * Get available subscription plans
   */
  async getAvailablePlans() {
    return await Plan.find({ isActive: true }).sort({ tierLevel: 1 });
  }

  /**
   * Reactivate a canceled-but-active subscription (cancel at period end = false)
   */
  async reactivateSubscription(subscriptionId: string) {
    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) throw new NotFoundError('Subscription');

    if (subscription.status !== 'active' || !subscription.cancelAtPeriodEnd) {
      throw new Error('Subscription is not in a state that can be reactivated');
    }

    // Logic to update Stripe would go here (via stripeService)
    // For now, this is a placeholder for the orchestrator
  }
}

export const subscriptionService = new SubscriptionService();
