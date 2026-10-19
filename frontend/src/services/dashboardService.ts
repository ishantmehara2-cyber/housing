import { apiClient } from './apiClient';
import { ApiResponse, SearchPaginationMetadata } from '@housing-clone/shared';

export interface DashboardOverviewMetrics {
  propertyCounts: {
    total: number;
    active: number;
    pending: number;
    paused: number;
    rejected: number;
  };
  leadCounts: {
    total: number;
    newLeads: number;
    contacted: number;
    converted: number;
  };
  visitCounts: {
    total: number;
    upcoming: number;
    completed: number;
  };
  unreadNotifications: number;
  recentActivity: {
    leads: Array<{ id: string; status: string; createdAt: string; property: { title: string } }>;
    visits: Array<{ id: string; status: string; scheduledDate: string; timeSlot: string; property: { title: string } }>;
  };
}

export const dashboardService = {
  async getOverviewMetrics(): Promise<DashboardOverviewMetrics> {
    const res = await apiClient.get<ApiResponse<DashboardOverviewMetrics>>('/dashboard/overview');
    return res.data.data!;
  },

  async getManagedProperties(page = 1, limit = 20, status?: string) {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.set('status', status);

    const res = await apiClient.get<ApiResponse<{ items: unknown[]; pagination: SearchPaginationMetadata }>>(
      `/dashboard/properties?${params.toString()}`
    );
    return res.data.data!;
  },

  async updatePropertyListingStatus(propertyId: string, status: string): Promise<void> {
    await apiClient.patch<ApiResponse>(`/dashboard/properties/${propertyId}/status`, { status });
  },
};
