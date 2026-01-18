import { AnalyticsEvent, AnalyticsEventType } from '../models/analytics-event.model';
import { Subscription, Payment, User, Content } from '../models';
import { logger } from '../utils';
import { Types } from 'mongoose';
import { getRedisClient, isRedisConnected } from '../config/redis';

export interface TrackEventData {
  userId?: string;
  sessionId?: string;
  eventType: AnalyticsEventType;
  eventName: string;
  properties?: Record<string, unknown>;
  deviceInfo?: {
    userAgent?: string;
    platform?: string;
    browser?: string;
    deviceType?: string;
  };
  location?: {
    country?: string;
    region?: string;
    city?: string;
  };
  referrer?: string;
  pageUrl?: string;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface DashboardMetrics {
  totalUsers: number;
  newUsers: number;
  activeSubscriptions: number;
  churnedSubscriptions: number;
  revenue: number;
  mrr: number;
  contentViews: number;
  topContent: Array<{ contentId: string; title: string; views: number }>;
}

export class AnalyticsService {
  /**
   * Track an analytics event
   */
  async track(data: TrackEventData): Promise<void> {
    try {
      await AnalyticsEvent.create({
        userId: data.userId ? new Types.ObjectId(data.userId) : undefined,
        sessionId: data.sessionId,
        eventType: data.eventType,
        eventName: data.eventName,
        properties: data.properties || {},
        deviceInfo: data.deviceInfo,
        location: data.location,
        referrer: data.referrer,
        pageUrl: data.pageUrl,
        timestamp: new Date(),
      });

      logger.debug('Analytics event tracked', { 
        eventType: data.eventType, 
        eventName: data.eventName 
      });
    } catch (error) {
      // Don't fail requests due to analytics errors
      logger.error('Failed to track analytics event', { 
        data, 
        error: error instanceof Error ? error.message : 'Unknown' 
      });
    }
  }

  /**
   * Get dashboard overview metrics
   */
  /**
   * Get dashboard overview metrics
   */
  async getDashboardMetrics(range: DateRange): Promise<DashboardMetrics> {
    const cacheKey = `analytics:dashboard:${range.start.toISOString()}:${range.end.toISOString()}`;

    try {
      if (await isRedisConnected()) {
        const redis = getRedisClient();
        const cached = await redis.get(cacheKey);
        if (cached) {
          logger.debug('Dashboard metrics cache hit');
          return JSON.parse(cached);
        }
      }
    } catch (error) {
      logger.warn('Cache read error', { error });
    }

    const [
      totalUsers,
      newUsers,
      subscriptionStats,
      revenueStats,
      contentStats,
    ] = await Promise.all([
      User.countDocuments({ status: 'active' }),
      User.countDocuments({ 
        createdAt: { $gte: range.start, $lte: range.end } 
      }),
      this.getSubscriptionStats(range),
      this.getRevenueStats(range),
      this.getContentStats(range),
    ]);

    const metrics = {
      totalUsers,
      newUsers,
      activeSubscriptions: subscriptionStats.active,
      churnedSubscriptions: subscriptionStats.churned,
      revenue: revenueStats.total,
      mrr: revenueStats.mrr,
      contentViews: contentStats.totalViews,
      topContent: contentStats.top,
    };

    try {
      if (await isRedisConnected()) {
        const redis = getRedisClient();
        await redis.setex(cacheKey, 300, JSON.stringify(metrics)); // Cache for 5 mins
      }
    } catch (error) {
      logger.warn('Cache write error', { error });
    }

    return metrics;
  }

  /**
   * Get subscription statistics
   */
  private async getSubscriptionStats(range: DateRange): Promise<{
    active: number;
    churned: number;
    newSignups: number;
    trialConversions: number;
  }> {
    const [activeCount, churnedCount, newSignups, trialConversions] = await Promise.all([
      Subscription.countDocuments({ status: 'active' }),
      Subscription.countDocuments({
        status: { $in: ['canceled', 'expired'] },
        canceledAt: { $gte: range.start, $lte: range.end }
      }),
      Subscription.countDocuments({
        createdAt: { $gte: range.start, $lte: range.end }
      }),
      AnalyticsEvent.countDocuments({
        eventType: 'subscription_started',
        'properties.fromTrial': true,
        timestamp: { $gte: range.start, $lte: range.end }
      }),
    ]);

    return {
      active: activeCount,
      churned: churnedCount,
      newSignups,
      trialConversions,
    };
  }

  /**
   * Get revenue statistics
   */
  private async getRevenueStats(range: DateRange): Promise<{
    total: number;
    mrr: number;
    averagePayment: number;
  }> {
    const [revenueAgg, activeSubsAgg] = await Promise.all([
      Payment.aggregate([
        {
          $match: {
            status: 'succeeded',
            createdAt: { $gte: range.start, $lte: range.end }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
            count: { $sum: 1 },
            average: { $avg: '$amount' }
          }
        }
      ]),
      Subscription.aggregate([
        {
          $match: { status: 'active' }
        },
        {
          $lookup: {
            from: 'plans',
            localField: 'planId',
            foreignField: '_id',
            as: 'plan'
          }
        },
        { $unwind: '$plan' },
        {
          $group: {
            _id: null,
            mrr: {
              $sum: {
                $cond: [
                  { $eq: ['$plan.interval', 'year'] },
                  { $divide: ['$plan.price', 12] },
                  '$plan.price'
                ]
              }
            }
          }
        }
      ]),
    ]);

    return {
      total: revenueAgg[0]?.total || 0,
      mrr: activeSubsAgg[0]?.mrr || 0,
      averagePayment: revenueAgg[0]?.average || 0,
    };
  }

  /**
   * Get content statistics
   */
  private async getContentStats(range: DateRange): Promise<{
    totalViews: number;
    top: Array<{ contentId: string; title: string; views: number }>;
  }> {
    const [viewCount, topContent] = await Promise.all([
      AnalyticsEvent.countDocuments({
        eventType: 'content_view',
        timestamp: { $gte: range.start, $lte: range.end }
      }),
      AnalyticsEvent.aggregate([
        {
          $match: {
            eventType: 'content_view',
            timestamp: { $gte: range.start, $lte: range.end }
          }
        },
        {
          $group: {
            _id: '$properties.contentId',
            views: { $sum: 1 }
          }
        },
        { $sort: { views: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'contents',
            localField: '_id',
            foreignField: '_id',
            as: 'content'
          }
        },
        { $unwind: { path: '$content', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            contentId: '$_id',
            title: '$content.title',
            views: 1
          }
        }
      ]),
    ]);

    return {
      totalViews: viewCount,
      top: topContent.map(c => ({
        contentId: c.contentId?.toString() || 'unknown',
        title: c.title || 'Unknown',
        views: c.views
      })),
    };
  }

  /**
   * Get event counts over time (for charts)
   */
  async getEventTimeSeries(
    eventType: AnalyticsEventType,
    range: DateRange,
    granularity: 'hour' | 'day' | 'week' | 'month' = 'day'
  ): Promise<Array<{ date: string; count: number }>> {
    const dateFormat = {
      hour: { $dateToString: { format: '%Y-%m-%d %H:00', date: '$timestamp' } },
      day: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
      week: { $dateToString: { format: '%Y-W%V', date: '$timestamp' } },
      month: { $dateToString: { format: '%Y-%m', date: '$timestamp' } },
    };

    const results = await AnalyticsEvent.aggregate([
      {
        $match: {
          eventType,
          timestamp: { $gte: range.start, $lte: range.end }
        }
      },
      {
        $group: {
          _id: dateFormat[granularity],
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: '$_id',
          count: 1
        }
      }
    ]);

    return results;
  }

  /**
   * Get conversion funnel data
   */
  async getConversionFunnel(range: DateRange): Promise<{
    signups: number;
    trialStarts: number;
    trialToSubscription: number;
    activeSubscribers: number;
  }> {
    const [signups, trialStarts, conversions, active] = await Promise.all([
      AnalyticsEvent.countDocuments({
        eventType: 'signup',
        timestamp: { $gte: range.start, $lte: range.end }
      }),
      Subscription.countDocuments({
        status: 'trialing',
        createdAt: { $gte: range.start, $lte: range.end }
      }),
      AnalyticsEvent.countDocuments({
        eventType: 'subscription_started',
        'properties.fromTrial': true,
        timestamp: { $gte: range.start, $lte: range.end }
      }),
      Subscription.countDocuments({ status: 'active' }),
    ]);

    return {
      signups,
      trialStarts,
      trialToSubscription: conversions,
      activeSubscribers: active,
    };
  }

  /**
   * Get recent analytics events
   */
  async getRecentEvents(limit = 20): Promise<Array<{
    name: string;
    user: string;
    path: string;
    time: Date;
  }>> {
    const events = await AnalyticsEvent.find({})
      .populate('userId', 'name email')
      .sort({ timestamp: -1 })
      .limit(limit);

    return events.map(e => ({
      name: e.eventName,
      user: (e.userId as any)?.name || 'Visitor',
      path: e.pageUrl || '/',
      time: e.timestamp,
    }));
  }

  /**
   * Get real-time metrics (active users, conversion rate, etc.)
   */
  async getRealtimeMetrics(): Promise<{
    totalEvents: number;
    activeUsers: number;
    conversionRate: number;
  }> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const [totalEvents, activeUsers, signups, subscriptions] = await Promise.all([
      AnalyticsEvent.countDocuments({ timestamp: { $gte: oneDayAgo } }),
      AnalyticsEvent.distinct('userId', { timestamp: { $gte: oneHourAgo }, userId: { $exists: true } }),
      AnalyticsEvent.countDocuments({ eventType: 'signup', timestamp: { $gte: oneDayAgo } }),
      AnalyticsEvent.countDocuments({ eventType: 'subscription_started', timestamp: { $gte: oneDayAgo } }),
    ]);

    const conversionRate = signups > 0 ? ((subscriptions / signups) * 100).toFixed(1) : '0';

    return {
      totalEvents,
      activeUsers: activeUsers.length,
      conversionRate: parseFloat(conversionRate),
    };
  }

  /**
   * Get recent sales/payments
   */
  async getRecentSales(limit = 10): Promise<Array<{
    id: string;
    user: string;
    email: string;
    amount: number;
    date: Date;
  }>> {
    const payments = await Payment.find({ status: 'succeeded' })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit);

    return payments.map(p => ({
      id: p._id.toString(),
      user: (p.userId as any)?.name || 'Unknown',
      email: (p.userId as any)?.email || '',
      amount: p.amount / 100, // Convert from cents
      date: p.createdAt,
    }));
  }
}

export const analyticsService = new AnalyticsService();
