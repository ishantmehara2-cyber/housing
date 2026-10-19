import { Request, Response, NextFunction } from 'express';
import { updatePreferencesSchema, recommendationFeedbackSchema, idParamSchema, ApiResponse } from '@housing-clone/shared';
import { RecommendationService } from '../services/recommendation/recommendation.service';
import { AppError } from '../middlewares/errorHandler';

export class RecommendationController {
  public static async getPersonalizedFeed(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const limit = Number(req.query.limit) || 12;

      const feed = await RecommendationService.getPersonalizedFeed(userId, limit);
      res.status(200).json({ success: true, data: feed });
    } catch (err) {
      next(err);
    }
  }

  public static async getSimilarProperties(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const { id } = idParamSchema.parse(req.params);
      const limit = Number(req.query.limit) || 4;

      const similar = await RecommendationService.getSimilarProperties(id, limit);
      res.status(200).json({ success: true, data: similar });
    } catch (err) {
      next(err);
    }
  }

  public static async getUserPreferences(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const pref = await RecommendationService.getUserPreferences(req.user.id);
      res.status(200).json({ success: true, data: pref });
    } catch (err) {
      next(err);
    }
  }

  public static async updateUserPreferences(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const input = updatePreferencesSchema.parse(req.body);
      const updated = await RecommendationService.updateUserPreferences(req.user.id, input);

      res.status(200).json({ success: true, message: 'Preferences updated successfully', data: updated });
    } catch (err) {
      next(err);
    }
  }

  public static async recordFeedback(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const { propertyId, feedback } = recommendationFeedbackSchema.parse(req.body);
      const result = await RecommendationService.recordFeedback(req.user.id, propertyId, feedback);

      res.status(200).json({ success: true, message: 'Feedback recorded', data: result });
    } catch (err) {
      next(err);
    }
  }
}
