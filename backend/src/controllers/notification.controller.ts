import { Request, Response, NextFunction } from 'express';
import { idParamSchema, paginationSchema, ApiResponse } from '@housing-clone/shared';
import { NotificationService } from '../services/notification/notification.service';
import { AppError } from '../middlewares/errorHandler';

export class NotificationController {
  public static async getUserNotifications(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const { page, limit } = paginationSchema.parse(req.query);
      const result = await NotificationService.getUserNotifications(req.user.id, page, limit);

      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  public static async getUnreadCount(req: Request, res: Response<ApiResponse<{ unreadCount: number }>>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const count = await NotificationService.getUnreadCount(req.user.id);
      res.status(200).json({ success: true, data: { unreadCount: count } });
    } catch (err) {
      next(err);
    }
  }

  public static async markAsRead(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const { id } = idParamSchema.parse(req.params);
      await NotificationService.markAsRead(req.user.id, id);

      res.status(200).json({ success: true, message: 'Notification marked as read' });
    } catch (err) {
      next(err);
    }
  }

  public static async markAllAsRead(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      await NotificationService.markAllAsRead(req.user.id);

      res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (err) {
      next(err);
    }
  }

  public static async deleteNotification(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const { id } = idParamSchema.parse(req.params);
      await NotificationService.deleteNotification(req.user.id, id);

      res.status(200).json({ success: true, message: 'Notification deleted' });
    } catch (err) {
      next(err);
    }
  }
}
