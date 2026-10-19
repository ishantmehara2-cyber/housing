import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '@housing-clone/shared';
import { AnalyticsService } from '../services/analytics.service';
import { AppError } from '../middlewares/errorHandler';

export class AnalyticsController {
  public static async recordEvent(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const { eventName, propertyId, metadata } = req.body;
      if (!eventName) throw new AppError(400, 'eventName is required', 'VALIDATION_ERROR');

      const result = await AnalyticsService.recordEvent({
        eventName,
        userId: req.user?.id,
        sessionId: req.headers['x-session-id'] as string,
        propertyId,
        metadata,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  public static async getAdminAnalyticsSummary(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const summary = await AnalyticsService.getAdminAnalyticsSummary();
      res.status(200).json({ success: true, data: summary });
    } catch (err) {
      next(err);
    }
  }
}
