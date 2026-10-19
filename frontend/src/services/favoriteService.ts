import { apiClient } from './apiClient';
import { ApiResponse, PropertySearchSummary } from '@housing-clone/shared';

export const favoriteService = {
  async getUserFavorites(): Promise<PropertySearchSummary[]> {
    const res = await apiClient.get<ApiResponse<PropertySearchSummary[]>>('/favorites');
    return res.data.data || [];
  },

  async addFavorite(propertyId: string): Promise<void> {
    await apiClient.post<ApiResponse>(`/favorites/${propertyId}`);
  },

  async removeFavorite(propertyId: string): Promise<void> {
    await apiClient.delete<ApiResponse>(`/favorites/${propertyId}`);
  },
};
