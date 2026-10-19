import { apiClient } from './apiClient';
import { ApiResponse, PropertyTypeSummary } from '@housing-clone/shared';

export const propertyTypeService = {
  async getPropertyTypes(): Promise<PropertyTypeSummary[]> {
    const res = await apiClient.get<ApiResponse<PropertyTypeSummary[]>>('/property-types');
    return res.data.data!;
  },
};
