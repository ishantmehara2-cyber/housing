import { apiClient } from './apiClient';
import { ApiResponse, NotificationChannel } from '@housing-clone/shared';

export interface NotificationRecord {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  channel: NotificationChannel;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export const notificationService = {
  async getUserNotifications(): Promise<NotificationRecord[]> {
    const res = await apiClient.get<ApiResponse<{ items: NotificationRecord[] }>>('/notifications');
    return res.data.data?.items || [];
  },

  async getUnreadCount(): Promise<number> {
    const res = await apiClient.get<ApiResponse<{ unreadCount: number }>>('/notifications/unread-count');
    return res.data.data?.unreadCount || 0;
  },

  async markAsRead(id: string): Promise<void> {
    await apiClient.patch<ApiResponse>(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.patch<ApiResponse>('/notifications/read-all');
  },

  async deleteNotification(id: string): Promise<void> {
    await apiClient.delete<ApiResponse>(`/notifications/${id}`);
  },
};
