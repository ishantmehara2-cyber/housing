import { apiClient } from './apiClient';
import { ApiResponse, PropertySearchSummary } from '@housing-clone/shared';

export const recentlyViewedService = {
  async recordView(propertyId: string): Promise<void> {
    try {
      await apiClient.post<ApiResponse>(`/recently-viewed/${propertyId}`);
    } catch {
      // Ignore background view recording failure
    }
  },

  async getUserHistory(): Promise<PropertySearchSummary[]> {
    const res = await apiClient.get<ApiResponse<PropertySearchSummary[]>>('/recently-viewed');
    return res.data.data || [];
  },

  async deleteItem(propertyId: string): Promise<void> {
    await apiClient.delete<ApiResponse>(`/recently-viewed/${propertyId}`);
  },

  async clearHistory(): Promise<void> {
    await apiClient.delete<ApiResponse>('/recently-viewed');
  },
};
