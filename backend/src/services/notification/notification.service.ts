import { db } from '../../config/db';
import { AppError } from '../../middlewares/errorHandler';
import { NotificationChannel } from '@housing-clone/shared';
import { DevEmailProvider, DevSmsProvider } from './devNotificationProviders';
import { SearchPaginationMetadata } from '@housing-clone/shared';

export class NotificationService {
  private static emailProvider = new DevEmailProvider();
  private static smsProvider = new DevSmsProvider();

  public static async createNotification(
    userId: string,
    title: string,
    message: string,
    type: string,
    channel: NotificationChannel = NotificationChannel.IN_APP
  ) {
    const notification = await db.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        channel: channel as unknown as import('@prisma/client').NotificationChannel,
      },
    });

    // Handle outbound channel notification dispatch
    if (channel === NotificationChannel.EMAIL) {
      const user = await db.user.findUnique({ where: { id: userId } });
      if (user?.email) {
        await NotificationService.emailProvider.sendEmail({
          to: user.email,
          subject: title,
          html: `<p>${message}</p>`,
        });
      }
    } else if (channel === NotificationChannel.SMS) {
      const user = await db.user.findUnique({ where: { id: userId } });
      if (user?.phone) {
        await NotificationService.smsProvider.sendSms({
          toPhone: user.phone,
          body: `${title}: ${message}`,
        });
      }
    }

    return notification;
  }

  public static async getUserNotifications(
    userId: string,
    page = 1,
    limit = 20
  ): Promise<{ items: unknown[]; pagination: SearchPaginationMetadata }> {
    const skip = (page - 1) * limit;

    const [items, total] = await db.$transaction([
      db.notification.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.notification.count({ where: { userId } }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  public static async getUnreadCount(userId: string): Promise<number> {
    return db.notification.count({
      where: { userId, isRead: false },
    });
  }

  public static async markAsRead(userId: string, notificationId: string) {
    const notif = await db.notification.findUnique({ where: { id: notificationId } });

    if (!notif || notif.userId !== userId) {
      throw new AppError(404, 'Notification not found', 'NOT_FOUND');
    }

    return db.notification.update({
      where: { id: notificationId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  public static async markAllAsRead(userId: string) {
    await db.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return true;
  }

  public static async deleteNotification(userId: string, notificationId: string) {
    const notif = await db.notification.findUnique({ where: { id: notificationId } });

    if (!notif || notif.userId !== userId) {
      throw new AppError(404, 'Notification not found', 'NOT_FOUND');
    }

    await db.notification.delete({ where: { id: notificationId } });
    return true;
  }
}
