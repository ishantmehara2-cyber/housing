import { Request, Response, NextFunction } from 'express';
import { updateLeadStatusSchema, idParamSchema, paginationSchema, ApiResponse } from '@housing-clone/shared';
import { LeadService } from '../services/lead.service';
import { AppError } from '../middlewares/errorHandler';

export class LeadController {
  public static async getUserLeads(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const { page, limit } = paginationSchema.parse(req.query);
      const statusFilter = req.query.status ? String(req.query.status) : undefined;

      const result = await LeadService.getUserLeads(req.user.id, req.user.role, page, limit, statusFilter);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  public static async getLeadById(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const { id } = idParamSchema.parse(req.params);
      const lead = await LeadService.getLeadById(req.user.id, req.user.role, id);

      res.status(200).json({ success: true, data: lead });
    } catch (err) {
      next(err);
    }
  }

  public static async updateLeadStatus(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const { id } = idParamSchema.parse(req.params);
      const input = updateLeadStatusSchema.parse(req.body);

      const updated = await LeadService.updateLeadStatus(req.user.id, req.user.role, id, input, req.ip);

      res.status(200).json({ success: true, message: 'Lead status updated', data: updated });
    } catch (err) {
      next(err);
    }
  }
}
