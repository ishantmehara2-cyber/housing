import { apiClient } from './apiClient';
import { ApiResponse } from '@housing-clone/shared';

export interface AdminAnalyticsSummary {
  eventMetrics: {
    totalEvents: number;
    propertyViews: number;
    searchesCount: number;
    enquiriesCount: number;
    visitsCount: number;
  };
  topProperties: Array<{
    id: string;
    title: string;
    slug: string;
    viewCount: number;
    enquiryCount: number;
  }>;
}

export const analyticsService = {
  async recordEvent(eventName: string, propertyId?: string, metadata?: Record<string, unknown>): Promise<void> {
    try {
      await apiClient.post<ApiResponse>('/analytics/events', { eventName, propertyId, metadata });
    } catch {
      // Non-blocking analytics error swallow
    }
  },

  async getAdminAnalyticsSummary(): Promise<AdminAnalyticsSummary> {
    const res = await apiClient.get<ApiResponse<AdminAnalyticsSummary>>('/admin/analytics/summary');
    return res.data.data!;
  },
};
