import { Request, Response, NextFunction } from 'express';
import { ApiResponse, PropertySearchSummary, idParamSchema } from '@housing-clone/shared';
import { RecentlyViewedService } from '../services/recentlyViewed.service';
import { AppError } from '../middlewares/errorHandler';

export class RecentlyViewedController {
  public static async recordView(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const { id } = idParamSchema.parse(req.params);
      await RecentlyViewedService.recordView(req.user.id, id);

      res.status(200).json({ success: true, message: 'View recorded' });
    } catch (err) {
      next(err);
    }
  }

  public static async getUserHistory(
    req: Request,
    res: Response<ApiResponse<PropertySearchSummary[]>>,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const history = await RecentlyViewedService.getUserHistory(req.user.id);
      res.status(200).json({ success: true, data: history });
    } catch (err) {
      next(err);
    }
  }

  public static async deleteItem(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const { id } = idParamSchema.parse(req.params);
      await RecentlyViewedService.deleteItem(req.user.id, id);

      res.status(200).json({ success: true, message: 'Item removed from history' });
    } catch (err) {
      next(err);
    }
  }

  public static async clearHistory(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      await RecentlyViewedService.clearHistory(req.user.id);

      res.status(200).json({ success: true, message: 'Browsing history cleared successfully' });
    } catch (err) {
      next(err);
    }
  }
}
