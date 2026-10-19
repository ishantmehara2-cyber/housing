import { apiClient } from './apiClient';
import { ApiResponse, PropertySearchQuery, PropertySearchResponse } from '@housing-clone/shared';

export const searchService = {
  async searchProperties(query: PropertySearchQuery): Promise<PropertySearchResponse> {
    const res = await apiClient.get<ApiResponse<PropertySearchResponse>>('/search/properties', {
      params: query,
    });
    return res.data.data!;
  },
};
