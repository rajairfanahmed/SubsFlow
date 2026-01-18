import Stripe from 'stripe';
import { config } from '../config';
import { 
  StripeError, 
  NotFoundError, 
  logger,
  ConflictError 
} from '../utils';
import { User, Plan, Subscription } from '../models';

export class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(config.stripe.secretKey);
  }

  /**
   * Create or retrieve a Stripe customer for a user
   */
  async getOrCreateCustomer(userId: string): Promise<string> {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError('User');

    if (user.stripeCustomerId) {
      return user.stripeCustomerId;
    }

    try {
      const customer = await this.stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user._id.toString(),
        },
      });

      user.stripeCustomerId = customer.id;
      await user.save();

      logger.info('Stripe customer created', { userId, customerId: customer.id });
      return customer.id;
    } catch (error) {
      logger.error('Stripe customer creation failed', { userId, error });
      throw new StripeError('Failed to create billing account');
    }
  }

  /**
   * Create a Checkout Session for a subscription
   */
  async createCheckoutSession(
    userId: string, 
    priceId: string, 
    successUrl: string, 
    cancelUrl: string
  ): Promise<Stripe.Checkout.Session> {
    const customerId = await this.getOrCreateCustomer(userId);

    try {
      const session = await this.stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          userId,
          priceId,
        },
        subscription_data: {
          metadata: {
            userId,
          },
        },
      });

      logger.info('Checkout session created', { userId, sessionId: session.id });
      return session;
    } catch (error) {
      logger.error('Checkout session creation failed', { userId, priceId, error });
      throw new StripeError('Failed to initiate checkout');
    }
  }

  /**
   * Create a Portal Session for subscription management
   */
  async createPortalSession(userId: string, returnUrl: string): Promise<Stripe.BillingPortal.Session> {
    const user = await User.findById(userId);
    if (!user?.stripeCustomerId) {
      throw new ConflictError('No billing account found for this user');
    }

    try {
      const session = await this.stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: returnUrl,
      });

      return session;
    } catch (error) {
      logger.error('Portal session creation failed', { userId, error });
      throw new StripeError('Failed to open billing portal');
    }
  }

  /**
   * Cancel a subscription in Stripe
   */
  async cancelSubscription(subscriptionId: string, atPeriodEnd: boolean = true): Promise<Stripe.Subscription> {
    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) throw new NotFoundError('Subscription');

    try {
      let stripeSubscription: Stripe.Subscription;
      
      if (atPeriodEnd) {
        stripeSubscription = await this.stripe.subscriptions.update(
          subscription.stripeSubscriptionId,
          { cancel_at_period_end: true }
        );
      } else {
        stripeSubscription = await this.stripe.subscriptions.cancel(
          subscription.stripeSubscriptionId
        );
      }

      logger.info('Subscription canceled in Stripe', { 
        subscriptionId, 
        atPeriodEnd,
        stripeId: stripeSubscription.id 
      });
      return stripeSubscription;
    } catch (error) {
      logger.error('Subscription cancellation failed', { subscriptionId, error });
      throw new StripeError('Failed to cancel subscription');
    }
  }

  /**
   * Update a subscription in Stripe (Upgrade/Downgrade)
   */
  async updateSubscription(subscriptionId: string, newPriceId: string): Promise<Stripe.Subscription> {
    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) throw new NotFoundError('Subscription');

    try {
      const stripeSub = await this.stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);
      const itemId = stripeSub.items.data[0]?.id;
      
      if (!itemId) {
        throw new StripeError('No subscription item found');
      }
      
      const updatedSubscription = await this.stripe.subscriptions.update(
        subscription.stripeSubscriptionId,
        {
          items: [{
            id: itemId,
            price: newPriceId,
          }],
          proration_behavior: 'always_invoice',
        }
      );

      logger.info('Subscription updated in Stripe', { 
        subscriptionId, 
        newPriceId,
        stripeId: updatedSubscription.id 
      });
      return updatedSubscription;
    } catch (error) {
      logger.error('Subscription update failed', { subscriptionId, newPriceId, error });
      throw new StripeError('Failed to update subscription');
    }
  }

  /**
   * Handle Webhook Signature Verification
   */
  constructEvent(payload: string | Buffer, signature: string): Stripe.Event {
    try {
      return this.stripe.webhooks.constructEvent(
        payload,
        signature,
        config.stripe.webhookSecret
      );
    } catch (error) {
      logger.error('Webhook signature verification failed', { error });
      throw new StripeError('Invalid webhook signature');
    }
  }

  /**
   * Retrieve Subscription from Stripe
   */
  async getStripeSubscription(id: string): Promise<Stripe.Subscription> {
    try {
      return await this.stripe.subscriptions.retrieve(id);
    } catch (error) {
      logger.error('Failed to retrieve Stripe subscription', { id, error });
      throw new StripeError('External billing service error');
    }
  }

  /**
   * Retrieve Invoice from Stripe
   */
  async getStripeInvoice(id: string): Promise<Stripe.Invoice> {
    try {
      return await this.stripe.invoices.retrieve(id);
    } catch (error) {
      logger.error('Failed to retrieve Stripe invoice', { id, error });
      throw new StripeError('External billing service error');
    }
  }

  /**
   * Get all plans from Stripe (for syncing)
   */
  async listStripePrices(): Promise<Stripe.Price[]> {
    try {
      const prices = await this.stripe.prices.list({
        active: true,
        type: 'recurring',
        limit: 100,
      });
      return prices.data;
    } catch (error) {
      logger.error('Failed to list Stripe prices', { error });
      throw new StripeError('External billing service error');
    }
  }
}

export const stripeService = new StripeService();
