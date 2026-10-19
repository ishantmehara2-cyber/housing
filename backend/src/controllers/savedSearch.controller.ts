import { Request, Response, NextFunction } from 'express';
import { createSavedSearchSchema, updateSavedSearchSchema, idParamSchema, ApiResponse } from '@housing-clone/shared';
import { SavedSearchService } from '../services/savedSearch.service';
import { AppError } from '../middlewares/errorHandler';

export class SavedSearchController {
  public static async createSavedSearch(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const input = createSavedSearchSchema.parse(req.body);
      const result = await SavedSearchService.createSavedSearch(req.user.id, input);

      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  public static async getUserSavedSearches(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const searches = await SavedSearchService.getUserSavedSearches(req.user.id);
      res.status(200).json({ success: true, data: searches });
    } catch (err) {
      next(err);
    }
  }

  public static async getSavedSearchById(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const { id } = idParamSchema.parse(req.params);
      const search = await SavedSearchService.getSavedSearchById(req.user.id, id);

      res.status(200).json({ success: true, data: search });
    } catch (err) {
      next(err);
    }
  }

  public static async updateSavedSearch(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const { id } = idParamSchema.parse(req.params);
      const input = updateSavedSearchSchema.parse(req.body);
      const updated = await SavedSearchService.updateSavedSearch(req.user.id, id, input);

      res.status(200).json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  public static async deleteSavedSearch(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const { id } = idParamSchema.parse(req.params);
      await SavedSearchService.deleteSavedSearch(req.user.id, id);

      res.status(200).json({ success: true, message: 'Saved search deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
}
