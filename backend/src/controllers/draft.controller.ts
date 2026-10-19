import { Request, Response, NextFunction } from 'express';
import {
  createDraftSchema,
  updateDraftSchema,
  idParamSchema,
  ApiResponse,
  PropertyDetail,
} from '@housing-clone/shared';
import { DraftService } from '../services/draft.service';
import { AppError } from '../middlewares/errorHandler';

export class DraftController {
  public static async createDraft(
    req: Request,
    res: Response<ApiResponse<PropertyDetail>>,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const input = createDraftSchema.parse(req.body);
      const result = await DraftService.createDraft(req.user.id, req.user.role, input);

      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  public static async getDrafts(
    req: Request,
    res: Response<ApiResponse<PropertyDetail[]>>,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const drafts = await DraftService.getDrafts(req.user.id);
      res.status(200).json({ success: true, data: drafts });
    } catch (err) {
      next(err);
    }
  }

  public static async getDraftById(
    req: Request,
    res: Response<ApiResponse<PropertyDetail>>,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const { id } = idParamSchema.parse(req.params);
      const draft = await DraftService.getDraftById(req.user.id, req.user.role, id);

      res.status(200).json({ success: true, data: draft });
    } catch (err) {
      next(err);
    }
  }

  public static async updateDraft(
    req: Request,
    res: Response<ApiResponse<PropertyDetail>>,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const { id } = idParamSchema.parse(req.params);
      const input = updateDraftSchema.parse(req.body);

      const updated = await DraftService.updateDraft(req.user.id, req.user.role, id, input);

      res.status(200).json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  public static async deleteDraft(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const { id } = idParamSchema.parse(req.params);
      await DraftService.deleteDraft(req.user.id, req.user.role, id);

      res.status(200).json({ success: true, message: 'Draft deleted successfully' });
    } catch (err) {
      next(err);
    }
  }

  public static async submitDraft(
    req: Request,
    res: Response<ApiResponse<PropertyDetail>>,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const { id } = idParamSchema.parse(req.params);
      const result = await DraftService.submitDraft(req.user.id, req.user.role, id, req.ip);

      res.status(200).json({
        success: true,
        message: 'Property submitted successfully and is pending approval',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}
