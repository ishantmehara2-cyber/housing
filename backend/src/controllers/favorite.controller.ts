import { Request, Response, NextFunction } from 'express';
import { ApiResponse, PropertySearchSummary, idParamSchema, paginationSchema, SearchPaginationMetadata } from '@housing-clone/shared';
import { FavoriteService } from '../services/favorite.service';
import { AppError } from '../middlewares/errorHandler';

export class FavoriteController {
  public static async addFavorite(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const { id } = idParamSchema.parse(req.params);
      await FavoriteService.addFavorite(req.user.id, id);

      res.status(200).json({ success: true, message: 'Property saved to favorites' });
    } catch (err) {
      next(err);
    }
  }

  public static async removeFavorite(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const { id } = idParamSchema.parse(req.params);
      await FavoriteService.removeFavorite(req.user.id, id);

      res.status(200).json({ success: true, message: 'Property removed from favorites' });
    } catch (err) {
      next(err);
    }
  }

  public static async checkFavoriteStatus(req: Request, res: Response<ApiResponse<{ isFavorite: boolean }>>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const { id } = idParamSchema.parse(req.params);
      const isFav = await FavoriteService.isFavorite(req.user.id, id);

      res.status(200).json({ success: true, data: { isFavorite: isFav } });
    } catch (err) {
      next(err);
    }
  }

  public static async getUserFavorites(
    req: Request,
    res: Response<ApiResponse<{ items: PropertySearchSummary[]; pagination: SearchPaginationMetadata }>>,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const { page, limit } = paginationSchema.parse(req.query);
      const result = await FavoriteService.getUserFavorites(req.user.id, page, limit);

      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}
