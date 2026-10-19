import { Request, Response, NextFunction } from 'express';
import { createVisitSchema, updateVisitStatusSchema, idParamSchema, paginationSchema, ApiResponse } from '@housing-clone/shared';
import { VisitService } from '../services/visit.service';
import { AppError } from '../middlewares/errorHandler';

export class VisitController {
  public static async createVisit(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const input = createVisitSchema.parse(req.body);
      const visit = await VisitService.createVisit(req.user.id, input, req.ip);

      res.status(201).json({ success: true, message: 'Property visit scheduled successfully', data: visit });
    } catch (err) {
      next(err);
    }
  }

  public static async getUserVisits(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const { page, limit } = paginationSchema.parse(req.query);
      const result = await VisitService.getUserVisits(req.user.id, req.user.role, page, limit);

      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  public static async getVisitById(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const { id } = idParamSchema.parse(req.params);
      const visit = await VisitService.getVisitById(req.user.id, req.user.role, id);

      res.status(200).json({ success: true, data: visit });
    } catch (err) {
      next(err);
    }
  }

  public static async updateVisitStatus(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const { id } = idParamSchema.parse(req.params);
      const input = updateVisitStatusSchema.parse(req.body);

      const updated = await VisitService.updateVisitStatus(req.user.id, req.user.role, id, input, req.ip);

      res.status(200).json({ success: true, message: 'Visit status updated', data: updated });
    } catch (err) {
      next(err);
    }
  }
}
