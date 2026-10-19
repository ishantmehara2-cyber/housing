import { Request, Response, NextFunction } from 'express';
import { ApiResponse, UserSummary } from '@housing-clone/shared';
import { UserService } from '../services/user.service';
import { AppError } from '../middlewares/errorHandler';

export class UserController {
  public static async getCurrentUser(req: Request, res: Response<ApiResponse<UserSummary>>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');
      }

      const user = await UserService.findById(req.user.id);

      if (!user) {
        throw new AppError(404, 'User profile not found', 'NOT_FOUND');
      }

      res.status(200).json({
        success: true,
        data: UserService.toUserSummary(user),
      });
    } catch (err) {
      next(err);
    }
  }
}
