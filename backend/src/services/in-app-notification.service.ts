import { InAppNotification, User } from '../models';
import { logger } from '../utils';
import { Types } from 'mongoose';

export interface CreateInAppNotificationData {
  userId: string;
  type: string;
  title: string;
  message: string;
  icon?: string;
  actionUrl?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  expiresAt?: Date;
  metadata?: Record<string, unknown>;
}

export class InAppNotificationService {
  /**
   * Create a new in-app notification
   */
  async create(data: CreateInAppNotificationData): Promise<void> {
    try {
      // Check user preferences
      const user = await User.findById(data.userId);
      if (!user) return;

      // Skip if user has disabled in-app notifications for this type
      // (Preferences would be checked here in a more complete implementation)

      await InAppNotification.create({
        userId: new Types.ObjectId(data.userId),
        type: data.type,
        title: data.title,
        message: data.message,
        icon: data.icon,
        actionUrl: data.actionUrl,
        priority: data.priority || 'normal',
        expiresAt: data.expiresAt,
        metadata: data.metadata,
      });

      logger.debug('In-app notification created', { userId: data.userId, type: data.type });
    } catch (error) {
      logger.error('Failed to create in-app notification', { 
        data, 
        error: error instanceof Error ? error.message : 'Unknown' 
      });
    }
  }

  /**
   * Get user's unread notifications
   */
  async getUnread(userId: string, limit: number = 20): Promise<typeof InAppNotification extends new () => infer T ? T[] : never> {
    return await InAppNotification.find({
      userId,
      read: false,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ]
    })
    .sort({ priority: -1, createdAt: -1 })
    .limit(limit) as any;
  }

  /**
   * Get all notifications for user (with pagination)
   */
  async getAll(
    userId: string, 
    options: { limit?: number; offset?: number; unreadOnly?: boolean } = {}
  ): Promise<{ notifications: any[]; total: number; unreadCount: number }> {
    const { limit = 20, offset = 0, unreadOnly = false } = options;

    const query: Record<string, unknown> = { userId };
    if (unreadOnly) {
      query.read = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      InAppNotification.find(query)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit),
      InAppNotification.countDocuments(query),
      InAppNotification.countDocuments({ userId, read: false }),
    ]);

    return { notifications, total, unreadCount };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    const result = await InAppNotification.updateOne(
      { _id: notificationId, userId },
      { read: true, readAt: new Date() }
    );
    return result.modifiedCount > 0;
  }

  /**
   * Mark all notifications as read for user
   */
  async markAllAsRead(userId: string): Promise<number> {
    const result = await InAppNotification.updateMany(
      { userId, read: false },
      { read: true, readAt: new Date() }
    );
    return result.modifiedCount;
  }

  /**
   * Delete a notification
   */
  async delete(notificationId: string, userId: string): Promise<boolean> {
    const result = await InAppNotification.deleteOne({ _id: notificationId, userId });
    return result.deletedCount > 0;
  }

  /**
   * Get unread count for user
   */
  async getUnreadCount(userId: string): Promise<number> {
    return await InAppNotification.countDocuments({ userId, read: false });
  }

  /**
   * Create notification for subscription events
   */
  async notifySubscriptionCreated(userId: string, planName: string): Promise<void> {
    await this.create({
      userId,
      type: 'subscription_created',
      title: 'Welcome to ' + planName + '!',
      message: 'Your subscription is now active. Enjoy all the premium features!',
      icon: '🎉',
      actionUrl: '/dashboard',
      priority: 'high',
    });
  }

  async notifyPaymentFailed(userId: string, amount: string): Promise<void> {
    await this.create({
      userId,
      type: 'payment_failed',
      title: 'Payment Failed',
      message: `Your payment of ${amount} could not be processed. Please update your payment method.`,
      icon: '⚠️',
      actionUrl: '/billing',
      priority: 'urgent',
    });
  }

  async notifyTrialEnding(userId: string, daysLeft: number): Promise<void> {
    await this.create({
      userId,
      type: 'trial_ending',
      title: 'Trial Ending Soon',
      message: `Your free trial ends in ${daysLeft} days. Subscribe now to keep your access!`,
      icon: '⏰',
      actionUrl: '/pricing',
      priority: 'high',
    });
  }

  async notifyNewContent(userId: string, contentTitle: string, contentId: string): Promise<void> {
    await this.create({
      userId,
      type: 'new_content',
      title: 'New Content Available',
      message: `Check out: ${contentTitle}`,
      icon: '📚',
      actionUrl: `/content/${contentId}`,
      priority: 'normal',
    });
  }
}

export const inAppNotificationService = new InAppNotificationService();
