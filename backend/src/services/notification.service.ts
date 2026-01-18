import { Notification, Subscription, User, Plan } from '../models';
import { emailService } from './email.service';
import { logger } from '../utils';

export class NotificationService {
  /**
   * Send welcome email after registration
   */
  async sendWelcomeNotification(userId: string, verificationToken: string): Promise<void> {
    const user = await User.findById(userId);
    if (!user) return;

    const result = await emailService.sendWelcomeEmail(
      user.email,
      user.name,
      verificationToken
    );

    await emailService.recordNotification(
      userId,
      'welcome',
      `Welcome to SubsFlow - Verify Your Email`,
      'Welcome email with verification link',
      result
    );
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetNotification(userId: string, resetToken: string): Promise<void> {
    const user = await User.findById(userId);
    if (!user) return;

    const result = await emailService.sendPasswordResetEmail(
      user.email,
      user.name,
      resetToken
    );

    await emailService.recordNotification(
      userId,
      'password_reset',
      'Password Reset Request',
      'Password reset email with link',
      result
    );
  }

  /**
   * Send subscription confirmation after successful purchase
   */
  async sendSubscriptionConfirmationNotification(subscriptionId: string): Promise<void> {
    const subscription = await Subscription.findById(subscriptionId)
      .populate<{ planId: { name: string } }>('planId');
    if (!subscription) return;

    const user = await User.findById(subscription.userId);
    if (!user) return;

    const planName = subscription.planId?.name || 'Premium';

    const result = await emailService.sendSubscriptionConfirmation(
      user.email,
      user.name,
      planName,
      subscription.currentPeriodEnd
    );

    await emailService.recordNotification(
      user._id.toString(),
      'subscription_created',
      `Your ${planName} Subscription is Active`,
      'Subscription confirmation email',
      result,
      { type: 'subscription', id: subscription._id }
    );
  }

  /**
   * Send payment failed notification
   */
  async sendPaymentFailedNotification(
    userId: string, 
    amount: number, 
    currency: string,
    subscriptionId: string
  ): Promise<void> {
    const user = await User.findById(userId);
    if (!user) return;

    const result = await emailService.sendPaymentFailedEmail(
      user.email,
      user.name,
      amount,
      currency
    );

    await emailService.recordNotification(
      userId,
      'payment_failed',
      'Action Required: Payment Failed',
      'Payment failed notification',
      result
    );
  }

  /**
   * Send renewal reminder (called by background job)
   */
  async sendRenewalReminderNotification(subscriptionId: string): Promise<void> {
    const subscription = await Subscription.findById(subscriptionId)
      .populate<{ planId: { name: string; price: number; currency: string } }>('planId');
    if (!subscription) return;

    const user = await User.findById(subscription.userId);
    if (!user) return;

    const plan = subscription.planId;
    if (!plan) return;

    const result = await emailService.sendRenewalReminderEmail(
      user.email,
      user.name,
      plan.name,
      subscription.currentPeriodEnd,
      plan.price,
      plan.currency || 'usd'
    );

    await emailService.recordNotification(
      user._id.toString(),
      'renewal_reminder',
      'Subscription Renewal Reminder',
      'Renewal reminder notification',
      result,
      { type: 'subscription', id: subscription._id }
    );
  }

  /**
   * Send trial ending notification (called by background job)
   */
  async sendTrialEndingNotification(subscriptionId: string): Promise<void> {
    const subscription = await Subscription.findById(subscriptionId)
      .populate<{ planId: { name: string } }>('planId');
    if (!subscription || !subscription.trialEnd) return;

    const user = await User.findById(subscription.userId);
    if (!user) return;

    const planName = subscription.planId?.name || 'Premium';

    const result = await emailService.sendTrialEndingEmail(
      user.email,
      user.name,
      planName,
      subscription.trialEnd
    );

    await emailService.recordNotification(
      user._id.toString(),
      'trial_ending',
      'Your Trial is Ending Soon',
      'Trial ending notification',
      result,
      { type: 'subscription', id: subscription._id }
    );
  }

  /**
   * Send subscription canceled confirmation
   */
  async sendSubscriptionCanceledNotification(subscriptionId: string): Promise<void> {
    const subscription = await Subscription.findById(subscriptionId)
      .populate<{ planId: { name: string } }>('planId');
    if (!subscription) return;

    const user = await User.findById(subscription.userId);
    if (!user) return;

    const planName = subscription.planId?.name || 'Premium';

    const result = await emailService.sendSubscriptionCanceledEmail(
      user.email,
      user.name,
      planName,
      subscription.currentPeriodEnd
    );

    await emailService.recordNotification(
      user._id.toString(),
      'subscription_canceled',
      'Subscription Canceled',
      'Subscription canceled confirmation',
      result,
      { type: 'subscription', id: subscription._id }
    );
  }

  /**
   * Get pending notifications for retry
   */
  async getPendingNotifications(limit: number = 50): Promise<typeof Notification extends new () => infer T ? T[] : never> {
    return await Notification.find({
      status: 'pending',
      retryCount: { $lt: 3 },
      scheduledFor: { $lte: new Date() }
    })
    .sort({ createdAt: 1 })
    .limit(limit) as any;
  }

  /**
   * Retry failed notification
   */
  async retryNotification(notificationId: string): Promise<void> {
    const notification = await Notification.findById(notificationId);
    if (!notification) return;

    const user = await User.findById(notification.userId);
    if (!user) return;

    // Resend based on type
    const result = await emailService.sendEmail({
      to: user.email,
      subject: notification.subject,
      html: notification.body,
    });

    notification.retryCount += 1;
    if (result.success) {
      notification.status = 'sent';
      notification.sentAt = new Date();
      notification.sendgridMessageId = result.messageId;
    } else {
      notification.failureReason = result.error;
      if (notification.retryCount >= 3) {
        notification.status = 'failed';
      }
    }

    await notification.save();
    logger.info('Notification retry attempted', { 
      notificationId, 
      success: result.success, 
      retryCount: notification.retryCount 
    });
  }
}

export const notificationService = new NotificationService();
