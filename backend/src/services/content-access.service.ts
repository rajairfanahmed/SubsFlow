import { ContentAccess } from '../models/content-access.model';
import { Content } from '../models';
import { logger } from '../utils';
import { Types } from 'mongoose';

export interface AccessLogData {
  userId: string;
  contentId: string;
  subscriptionId?: string;
  accessType: 'view' | 'download' | 'stream' | 'complete';
  accessGranted: boolean;
  denialReason?: string;
  userAgent?: string;
  ipAddress?: string;
  duration?: number;
  completionPercent?: number;
}

export class ContentAccessService {
  /**
   * Log content access event
   */
  async logAccess(data: AccessLogData): Promise<void> {
    try {
      await ContentAccess.create({
        userId: new Types.ObjectId(data.userId),
        contentId: new Types.ObjectId(data.contentId),
        subscriptionId: data.subscriptionId ? new Types.ObjectId(data.subscriptionId) : undefined,
        accessType: data.accessType,
        accessGranted: data.accessGranted,
        denialReason: data.denialReason,
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
        duration: data.duration,
        completionPercent: data.completionPercent,
      });
    } catch (error) {
      // Don't fail requests due to logging errors
      logger.error('Failed to log content access', { 
        data, 
        error: error instanceof Error ? error.message : 'Unknown' 
      });
    }
  }

  /**
   * Update engagement metrics on content
   */
  async updateEngagement(
    contentId: string, 
    action: 'view' | 'complete' | 'bookmark'
  ): Promise<void> {
    try {
      const updateField = action === 'view' ? 'engagement.views' 
        : action === 'complete' ? 'engagement.completions' 
        : 'engagement.bookmarks';

      await Content.findByIdAndUpdate(contentId, {
        $inc: { [updateField]: 1 }
      });
    } catch (error) {
      logger.error('Failed to update engagement', { contentId, action, error });
    }
  }

  /**
   * Get user's content access history
   */
  async getUserAccessHistory(
    userId: string, 
    limit: number = 20, 
    offset: number = 0
  ): Promise<typeof ContentAccess extends new () => infer T ? T[] : never> {
    return await ContentAccess.find({ 
      userId, 
      accessGranted: true 
    })
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .populate('contentId', 'title slug type thumbnailUrl') as any;
  }

  /**
   * Get content access analytics
   */
  async getContentAnalytics(contentId: string, days: number = 30): Promise<{
    totalViews: number;
    uniqueViewers: number;
    completions: number;
    averageDuration: number;
    accessDenials: number;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [stats] = await ContentAccess.aggregate([
      {
        $match: {
          contentId: new Types.ObjectId(contentId),
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          totalViews: { 
            $sum: { $cond: [{ $eq: ['$accessGranted', true] }, 1, 0] } 
          },
          uniqueViewers: { $addToSet: '$userId' },
          completions: { 
            $sum: { $cond: [{ $eq: ['$accessType', 'complete'] }, 1, 0] } 
          },
          totalDuration: { $sum: '$duration' },
          durationCount: { 
            $sum: { $cond: [{ $gt: ['$duration', 0] }, 1, 0] } 
          },
          accessDenials: { 
            $sum: { $cond: [{ $eq: ['$accessGranted', false] }, 1, 0] } 
          },
        },
      },
      {
        $project: {
          totalViews: 1,
          uniqueViewers: { $size: '$uniqueViewers' },
          completions: 1,
          averageDuration: { 
            $cond: [
              { $gt: ['$durationCount', 0] },
              { $divide: ['$totalDuration', '$durationCount'] },
              0
            ]
          },
          accessDenials: 1,
        },
      },
    ]);

    return stats || {
      totalViews: 0,
      uniqueViewers: 0,
      completions: 0,
      averageDuration: 0,
      accessDenials: 0,
    };
  }
}

export const contentAccessService = new ContentAccessService();
