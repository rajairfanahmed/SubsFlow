import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { analyticsService, TrackEventData, DateRange } from '../services/analytics.service';
import { AnalyticsEventType } from '../models/analytics-event.model';
import { ApiResponse } from '../types';

export class AnalyticsController {
  /**
   * POST /analytics/track
   * Track an analytics event
   */
  async trackEvent(req: Request, res: Response): Promise<void> {
    const eventData: TrackEventData = {
      userId: req.userId,
      sessionId: req.body.sessionId,
      eventType: req.body.eventType,
      eventName: req.body.eventName,
      properties: req.body.properties,
      deviceInfo: {
        userAgent: req.get('user-agent'),
        platform: req.body.platform,
        browser: req.body.browser,
        deviceType: req.body.deviceType,
      },
      referrer: req.get('referer'),
      pageUrl: req.body.pageUrl,
    };

    await analyticsService.track(eventData);

    const response: ApiResponse = {
      success: true,
      data: { tracked: true },
    };

    res.status(StatusCodes.OK).json(response);
  }

  /**
   * GET /analytics/dashboard
   * Get dashboard overview (admin only)
   */
  async getDashboard(req: Request, res: Response): Promise<void> {
    const range = this.parseDateRange(req);
    const metrics = await analyticsService.getDashboardMetrics(range);

    const response: ApiResponse = {
      success: true,
      data: { metrics },
    };

    res.status(StatusCodes.OK).json(response);
  }

  /**
   * GET /analytics/timeseries
   * Get event time series data (admin only)
   */
  async getTimeSeries(req: Request, res: Response): Promise<void> {
    const { eventType, granularity = 'day' } = req.query;
    
    if (!eventType) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Event type required' }
      });
      return;
    }

    const range = this.parseDateRange(req);
    const data = await analyticsService.getEventTimeSeries(
      eventType as AnalyticsEventType,
      range,
      granularity as 'hour' | 'day' | 'week' | 'month'
    );

    const response: ApiResponse = {
      success: true,
      data: { timeseries: data },
    };

    res.status(StatusCodes.OK).json(response);
  }

  /**
   * GET /analytics/funnel
   * Get conversion funnel data (admin only)
   */
  async getConversionFunnel(req: Request, res: Response): Promise<void> {
    const range = this.parseDateRange(req);
    const funnel = await analyticsService.getConversionFunnel(range);

    const response: ApiResponse = {
      success: true,
      data: { funnel },
    };

    res.status(StatusCodes.OK).json(response);
  }

  /**
   * GET /analytics/events
   * Get recent analytics events (admin only)
   */
  async getRecentEvents(req: Request, res: Response): Promise<void> {
    const { limit = 20 } = req.query;
    const events = await analyticsService.getRecentEvents(Number(limit));

    const response: ApiResponse = {
      success: true,
      data: { events },
    };

    res.status(StatusCodes.OK).json(response);
  }

  /**
   * GET /analytics/realtime
   * Get real-time metrics (admin only)
   */
  async getRealtimeMetrics(req: Request, res: Response): Promise<void> {
    const metrics = await analyticsService.getRealtimeMetrics();

    const response: ApiResponse = {
      success: true,
      data: metrics,
    };

    res.status(StatusCodes.OK).json(response);
  }

  /**
   * GET /analytics/recent-sales
   * Get recent sales/payments (admin only)
   */
  async getRecentSales(req: Request, res: Response): Promise<void> {
    const { limit = 10 } = req.query;
    const sales = await analyticsService.getRecentSales(Number(limit));

    const response: ApiResponse = {
      success: true,
      data: { sales },
    };

    res.status(StatusCodes.OK).json(response);
  }

  /**
   * Parse date range from query params
   */
  private parseDateRange(req: Request): DateRange {
    const { startDate, endDate, period } = req.query;

    // Predefined periods
    if (period) {
      const now = new Date();
      const start = new Date();
      
      switch (period) {
        case '7d':
          start.setDate(now.getDate() - 7);
          break;
        case '30d':
          start.setDate(now.getDate() - 30);
          break;
        case '90d':
          start.setDate(now.getDate() - 90);
          break;
        case 'ytd':
          start.setMonth(0, 1);
          start.setHours(0, 0, 0, 0);
          break;
        default: // Default to 30 days
          start.setDate(now.getDate() - 30);
      }
      
      return { start, end: now };
    }

    // Custom date range
    return {
      start: startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: endDate ? new Date(endDate as string) : new Date(),
    };
  }
}

export const analyticsController = new AnalyticsController();
