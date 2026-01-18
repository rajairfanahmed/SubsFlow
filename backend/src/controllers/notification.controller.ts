import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { inAppNotificationService } from '../services/in-app-notification.service';
import { ApiResponse } from '../types';

export class NotificationController {
  /**
   * GET /notifications
   * Get user's notifications with pagination
   */
  async getNotifications(req: Request, res: Response): Promise<void> {
    const { limit = 20, offset = 0, unreadOnly } = req.query;

    const result = await inAppNotificationService.getAll(req.userId!, {
      limit: Number(limit),
      offset: Number(offset),
      unreadOnly: unreadOnly === 'true',
    });

    const response: ApiResponse = {
      success: true,
      data: result,
    };

    res.status(StatusCodes.OK).json(response);
  }

  /**
   * GET /notifications/unread
   * Get user's unread notifications
   */
  async getUnread(req: Request, res: Response): Promise<void> {
    const { limit = 20 } = req.query;
    
    const notifications = await inAppNotificationService.getUnread(
      req.userId!, 
      Number(limit)
    );

    const response: ApiResponse = {
      success: true,
      data: { notifications },
    };

    res.status(StatusCodes.OK).json(response);
  }

  /**
   * GET /notifications/count
   * Get unread notification count
   */
  async getUnreadCount(req: Request, res: Response): Promise<void> {
    const count = await inAppNotificationService.getUnreadCount(req.userId!);

    const response: ApiResponse = {
      success: true,
      data: { unreadCount: count },
    };

    res.status(StatusCodes.OK).json(response);
  }

  /**
   * PATCH /notifications/:id/read
   * Mark notification as read
   */
  async markAsRead(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    
    if (!id) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Notification ID required' }
      });
      return;
    }

    const success = await inAppNotificationService.markAsRead(id, req.userId!);

    const response: ApiResponse = {
      success: true,
      data: { marked: success },
    };

    res.status(StatusCodes.OK).json(response);
  }

  /**
   * PATCH /notifications/read-all
   * Mark all notifications as read
   */
  async markAllAsRead(req: Request, res: Response): Promise<void> {
    const count = await inAppNotificationService.markAllAsRead(req.userId!);

    const response: ApiResponse = {
      success: true,
      data: { markedCount: count },
    };

    res.status(StatusCodes.OK).json(response);
  }

  /**
   * DELETE /notifications/:id
   * Delete a notification
   */
  async deleteNotification(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    
    if (!id) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Notification ID required' }
      });
      return;
    }

    const success = await inAppNotificationService.delete(id, req.userId!);

    const response: ApiResponse = {
      success: true,
      data: { deleted: success },
    };

    res.status(StatusCodes.OK).json(response);
  }
}

export const notificationController = new NotificationController();
