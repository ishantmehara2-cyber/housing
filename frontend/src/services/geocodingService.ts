import { apiClient } from './apiClient';
import { ApiResponse } from '@housing-clone/shared';

export interface GeocodingResult {
  label: string;
  latitude: number;
  longitude: number;
  city?: string;
  locality?: string;
  subLocality?: string;
  formattedAddress: string;
}

export const geocodingService = {
  async searchAddress(query: string): Promise<GeocodingResult[]> {
    if (!query.trim()) return [];
    const res = await apiClient.get<ApiResponse<GeocodingResult[]>>(`/geocoding/search?q=${encodeURIComponent(query)}`);
    return res.data.data || [];
  },

  async reverseGeocode(latitude: number, longitude: number): Promise<GeocodingResult> {
    const res = await apiClient.get<ApiResponse<GeocodingResult>>(`/geocoding/reverse?lat=${latitude}&lng=${longitude}`);
    return res.data.data!;
  },
};
