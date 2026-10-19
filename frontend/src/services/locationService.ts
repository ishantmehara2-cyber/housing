import { apiClient } from './apiClient';
import {
  ApiResponse,
  StateSummary,
  CitySummary,
  LocalitySummary,
  SubLocalitySummary,
} from '@housing-clone/shared';

export const locationService = {
  async getStates(): Promise<StateSummary[]> {
    const res = await apiClient.get<ApiResponse<StateSummary[]>>('/locations/states');
    return res.data.data || [];
  },

  async getCities(stateId?: string): Promise<CitySummary[]> {
    const params = new URLSearchParams();
    if (stateId) params.set('stateId', stateId);

    const queryStr = params.toString() ? `?${params.toString()}` : '';
    const res = await apiClient.get<ApiResponse<CitySummary[]>>(`/locations/cities${queryStr}`);
    return res.data.data || [];
  },

  async getLocalities(cityIdentifier?: string): Promise<LocalitySummary[]> {
    if (!cityIdentifier) {
      const res = await apiClient.get<ApiResponse<LocalitySummary[]>>('/locations/localities');
      return res.data.data || [];
    }

    const res = await apiClient.get<ApiResponse<LocalitySummary[]>>(`/locations/localities?city=${encodeURIComponent(cityIdentifier)}`);
    return res.data.data || [];
  },

  async getSubLocalities(localityIdentifier?: string): Promise<SubLocalitySummary[]> {
    if (!localityIdentifier) {
      const res = await apiClient.get<ApiResponse<SubLocalitySummary[]>>('/locations/sub-localities');
      return res.data.data || [];
    }

    const res = await apiClient.get<ApiResponse<SubLocalitySummary[]>>(`/locations/sub-localities?locality=${encodeURIComponent(localityIdentifier)}`);
    return res.data.data || [];
  },
};
