import { apiClient } from './apiClient';
import { ApiResponse, AmenitySummary } from '@housing-clone/shared';

export const amenityService = {
  async getAmenities(): Promise<AmenitySummary[]> {
    const res = await apiClient.get<ApiResponse<AmenitySummary[]>>('/amenities');
    return res.data.data!;
  },
};
