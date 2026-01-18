import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Content } from '../models';
import { contentAccessService } from '../services/content-access.service';
import { ApiResponse } from '../types';
import { NotFoundError } from '../utils';

export class ContentController {
  /**
   * GET /content
   * List published content (with optional tier filter)
   */
  async listContent(req: Request, res: Response): Promise<void> {
    const { 
      page = 1, 
      limit = 20, 
      category, 
      type, 
      search 
    } = req.query;

    const query: Record<string, unknown> = { 
      status: 'published' 
    };

    if (category) query.category = category;
    if (type) query.type = type;
    if (search) {
      query.$text = { $search: search as string };
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const [content, total] = await Promise.all([
      Content.find(query)
        .select('-fileUrl') // Don't expose file URLs in list
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Content.countDocuments(query),
    ]);

    const response: ApiResponse = {
      success: true,
      data: {
        content,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    };

    res.status(StatusCodes.OK).json(response);
  }

  /**
   * GET /content/:contentId
   * Get single content item (requires access check via middleware)
   */
  async getContent(req: Request, res: Response): Promise<void> {
    // Content is already validated and attached by middleware
    const content = (req as any).content;
    if (!content) {
      throw new NotFoundError('Content');
    }

    // Log access
    if (req.userId) {
      const subscription = (req as any).subscription;
      contentAccessService.logAccess({
        userId: req.userId,
        contentId: content._id.toString(),
        subscriptionId: subscription?._id?.toString(),
        accessType: 'view',
        accessGranted: true,
        userAgent: req.get('user-agent'),
        ipAddress: req.ip,
      });

      // Update view count
      contentAccessService.updateEngagement(content._id.toString(), 'view');
    }

    const response: ApiResponse = {
      success: true,
      data: { content },
    };

    res.status(StatusCodes.OK).json(response);
  }

  /**
   * POST /content/:contentId/complete
   * Mark content as completed by user
   */
  async markComplete(req: Request, res: Response): Promise<void> {
    const contentId = req.params.contentId;
    if (!contentId) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Content ID is required' }
      });
      return;
    }

    const { duration, completionPercent } = req.body;
    const subscription = (req as any).subscription;

    await contentAccessService.logAccess({
      userId: req.userId!,
      contentId,
      subscriptionId: subscription?._id?.toString(),
      accessType: 'complete',
      accessGranted: true,
      duration,
      completionPercent,
    });

    await contentAccessService.updateEngagement(contentId, 'complete');

    const response: ApiResponse = {
      success: true,
      data: { message: 'Content marked as complete' },
    };

    res.status(StatusCodes.OK).json(response);
  }

  /**
   * GET /content/:contentId/analytics
   * Get content analytics (admin/content manager only)
   */
  async getAnalytics(req: Request, res: Response): Promise<void> {
    const contentId = req.params.contentId;
    if (!contentId) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Content ID is required' }
      });
      return;
    }
    
    const { days = 30 } = req.query;

    const analytics = await contentAccessService.getContentAnalytics(
      contentId, 
      Number(days)
    );

    const response: ApiResponse = {
      success: true,
      data: { analytics },
    };

    res.status(StatusCodes.OK).json(response);
  }

  /**
   * GET /content/history
   * Get user's content access history
   */
  async getHistory(req: Request, res: Response): Promise<void> {
    const { limit = 20, offset = 0 } = req.query;

    const history = await contentAccessService.getUserAccessHistory(
      req.userId!,
      Number(limit),
      Number(offset)
    );

    const response: ApiResponse = {
      success: true,
      data: { history },
    };

    res.status(StatusCodes.OK).json(response);
  }
}

export const contentController = new ContentController();
