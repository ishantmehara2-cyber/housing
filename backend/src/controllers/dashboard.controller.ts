import { Request, Response, NextFunction } from 'express';
import { paginationSchema, idParamSchema, ApiResponse, ListingState } from '@housing-clone/shared';
import { DashboardService } from '../services/dashboard.service';
import { AppError } from '../middlewares/errorHandler';

export class DashboardController {
  public static async getOverviewMetrics(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const result = await DashboardService.getOverviewMetrics(req.user.id, req.user.role);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  public static async getManagedProperties(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const { page, limit } = paginationSchema.parse(req.query);
      const statusFilter = req.query.status ? String(req.query.status) : undefined;

      const result = await DashboardService.getManagedProperties(req.user.id, req.user.role, page, limit, statusFilter);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  public static async updatePropertyListingStatus(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const { id } = idParamSchema.parse(req.params);
      const { status } = req.body;

      if (!status) throw new AppError(400, 'Status is required', 'VALIDATION_ERROR');

      const updated = await DashboardService.updatePropertyListingStatus(
        req.user.id,
        req.user.role,
        id,
        status as ListingState,
        req.ip
      );

      res.status(200).json({ success: true, message: 'Property status updated', data: updated });
    } catch (err) {
      next(err);
    }
  }
}
