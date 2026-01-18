import { Request, Response } from 'express';
import { stripeService } from '../services/stripe.service';
import { notificationService } from '../services/notification.service';
import { 
  Subscription, 
  Plan, 
  Payment, 
  ProcessedEvent, 
  Notification 
} from '../models';
import { logger } from '../utils';
import Stripe from 'stripe';
import mongoose from 'mongoose';

export class StripeWebhookHandler {
  /**
   * Main Webhook Entry Point
   */
  async handle(req: Request, res: Response): Promise<void> {
    const signature = req.headers['stripe-signature'] as string;
    
    let event: Stripe.Event;
    try {
      event = stripeService.constructEvent(req.body, signature);
    } catch (err) {
      res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown Error'}`);
      return;
    }

    // 1. Idempotency Check
    const alreadyProcessed = await ProcessedEvent.exists({ eventId: event.id });
    if (alreadyProcessed) {
      logger.info('Event already processed, skipping', { eventId: event.id });
      res.json({ received: true, status: 'already_processed' });
      return;
    }

    try {
      // 2. Route to specific handlers
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session, event.id);
          break;
        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice, event.id);
          break;
        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice, event.id);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription, event.id);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription, event.id);
          break;
        default:
          logger.debug(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      logger.error('Webhook handling failed', { 
        eventId: event.id, 
        type: event.type, 
        error: error instanceof Error ? error.message : 'Unknown' 
      });
      // Return 500 so Stripe retries
      res.status(500).json({ received: false, error: 'Internal failure' });
    }
  }

  /**
   * Handle successful checkout (Initial purchase)
   */
  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session, eventId: string): Promise<void> {
    const userId = session.metadata?.userId;
    const priceId = session.metadata?.priceId;
    const stripeSubscriptionId = session.subscription as string;

    if (!userId || !stripeSubscriptionId) {
      logger.error('Missing metadata in checkout session', { sessionId: session.id });
      return;
    }

    const mongooseSession = await mongoose.startSession();
    try {
      await mongooseSession.withTransaction(async () => {
        // Double check idempotency inside transaction
        await ProcessedEvent.create([{ 
          eventId, 
          eventType: 'checkout.session.completed' 
        }], { session: mongooseSession });

        const stripeSubscription = await stripeService.getStripeSubscription(stripeSubscriptionId);
        const plan = await Plan.findOne({ stripePriceId: priceId }).session(mongooseSession);
        
        if (!plan) throw new Error(`Plan not found for priceId: ${priceId}`);

        // Create local subscription
        const subscriptions = await Subscription.create([{
          userId,
          planId: plan._id,
          stripeSubscriptionId,
          stripeCustomerId: session.customer as string,
          status: stripeSubscription.status,
          currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
          currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
          cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
        }], { session: mongooseSession });

        const newSubscription = subscriptions[0];
        if (newSubscription) {
          // Send subscription confirmation email (async, don't await)
          notificationService.sendSubscriptionConfirmationNotification(newSubscription._id.toString())
            .catch((error: unknown) => logger.error('Failed to send subscription confirmation', { error }));
        }

        logger.info('Subscription initialized via webhook', { userId, stripeSubscriptionId });
      });
    } finally {
      await mongooseSession.endSession();
    }
  }

  /**
   * Handle recurring payments or successful retry
   */
  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice, eventId: string): Promise<void> {
    if (!invoice.subscription) return;

    const subscriptionId = typeof invoice.subscription === 'string' 
      ? invoice.subscription 
      : invoice.subscription.id;

    const mongooseSession = await mongoose.startSession();
    try {
      await mongooseSession.withTransaction(async () => {
        await ProcessedEvent.create([{ 
          eventId, 
          eventType: 'invoice.payment_succeeded' 
        }], { session: mongooseSession });

        const subscription = await Subscription.findOne({ 
          stripeSubscriptionId: subscriptionId 
        }).session(mongooseSession);

        if (!subscription) {
          logger.warn('Subscription not found for payment', { stripeSubId: subscriptionId });
          return;
        }

        // Get payment intent ID safely
        const paymentIntentId = typeof invoice.payment_intent === 'string'
          ? invoice.payment_intent
          : invoice.payment_intent?.id || `inv_${invoice.id}`;

        // Record payment
        await Payment.create([{
          userId: subscription.userId,
          subscriptionId: subscription._id,
          stripePaymentIntentId: paymentIntentId,
          stripeInvoiceId: invoice.id,
          amount: invoice.amount_paid,
          currency: invoice.currency,
          status: 'succeeded',
          invoiceUrl: invoice.hosted_invoice_url || undefined,
        }], { session: mongooseSession });

        // Update subscription end date if it was a renewal
        if (invoice.billing_reason === 'subscription_cycle' || invoice.billing_reason === 'subscription_create') {
          const stripeSubscription = await stripeService.getStripeSubscription(subscriptionId);
          subscription.currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);
          subscription.status = 'active';
          await subscription.save({ session: mongooseSession });
        }

        logger.info('Payment recorded and subscription updated', { invoiceId: invoice.id });
      });
    } finally {
      await mongooseSession.endSession();
    }
  }

  /**
   * Handle failed payments
   */
  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice, eventId: string): Promise<void> {
    if (!invoice.subscription) return;

    const subscriptionId = typeof invoice.subscription === 'string' 
      ? invoice.subscription 
      : invoice.subscription.id;

    const subscription = await Subscription.findOne({ 
      stripeSubscriptionId: subscriptionId 
    });

    if (!subscription) return;

    // Update status to past_due
    subscription.status = 'past_due';
    await subscription.save();

    // Notify user
    await Notification.create({
      userId: subscription.userId,
      type: 'payment_failed',
      channel: 'email',
      subject: 'Attention: Your payment failed',
      body: `Your payment of ${invoice.amount_due / 100} ${invoice.currency.toUpperCase()} failed. Please update your payment method.`,
      relatedEntity: { type: 'subscription', id: subscription._id }
    });

    logger.warn('Payment failed, subscription marked past_due', { stripeSubId: subscriptionId });
    
    await ProcessedEvent.create({ eventId, eventType: 'invoice.payment_failed' });
  }

  /**
   * Handle Subscription updates (Upgrade/Downgrade/Canceled period end)
   */
  private async handleSubscriptionUpdated(stripeSubscription: Stripe.Subscription, eventId: string): Promise<void> {
    const subscription = await Subscription.findOne({ 
      stripeSubscriptionId: stripeSubscription.id 
    });

    if (!subscription) return;

    subscription.status = stripeSubscription.status as typeof subscription.status;
    subscription.currentPeriodStart = new Date(stripeSubscription.current_period_start * 1000);
    subscription.currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);
    subscription.cancelAtPeriodEnd = stripeSubscription.cancel_at_period_end;
    
    if (stripeSubscription.canceled_at) {
      subscription.canceledAt = new Date(stripeSubscription.canceled_at * 1000);
    }

    await subscription.save();
    await ProcessedEvent.create({ eventId, eventType: 'customer.subscription.updated' });
    
    logger.info('Subscription updated from Stripe', { stripeSubId: stripeSubscription.id });
  }

  /**
   * Handle Subscription deletion (End of life)
   */
  private async handleSubscriptionDeleted(stripeSubscription: Stripe.Subscription, eventId: string): Promise<void> {
    const subscription = await Subscription.findOne({ 
      stripeSubscriptionId: stripeSubscription.id 
    });

    if (!subscription) return;

    subscription.status = 'expired';
    await subscription.save();
    
    await ProcessedEvent.create({ eventId, eventType: 'customer.subscription.deleted' });
    
    logger.info('Subscription expired/deleted from Stripe', { stripeSubId: stripeSubscription.id });
  }
}

export const stripeWebhookHandler = new StripeWebhookHandler();
