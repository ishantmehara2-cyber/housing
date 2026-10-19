import { apiClient } from './apiClient';
import { ApiResponse, PropertyDetail } from '@housing-clone/shared';

export const propertyService = {
  async getPropertyBySlug(slug: string): Promise<PropertyDetail> {
    const res = await apiClient.get<ApiResponse<PropertyDetail>>(`/properties/${slug}`);
    return res.data.data!;
  },
};
