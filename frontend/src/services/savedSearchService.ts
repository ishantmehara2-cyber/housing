import { apiClient } from './apiClient';
import { ApiResponse, CreateSavedSearchInput, UpdateSavedSearchInput } from '@housing-clone/shared';

export interface SavedSearchRecord {
  id: string;
  userId: string;
  name: string;
  searchCriteria: Record<string, unknown>;
  enableAlerts: boolean;
  createdAt: string;
}

export const savedSearchService = {
  async createSavedSearch(input: CreateSavedSearchInput): Promise<SavedSearchRecord> {
    const res = await apiClient.post<ApiResponse<SavedSearchRecord>>('/saved-searches', input);
    return res.data.data!;
  },

  async getUserSavedSearches(): Promise<SavedSearchRecord[]> {
    const res = await apiClient.get<ApiResponse<SavedSearchRecord[]>>('/saved-searches');
    return res.data.data || [];
  },

  async getSavedSearchById(id: string): Promise<SavedSearchRecord> {
    const res = await apiClient.get<ApiResponse<SavedSearchRecord>>(`/saved-searches/${id}`);
    return res.data.data!;
  },

  async updateSavedSearch(id: string, input: UpdateSavedSearchInput): Promise<SavedSearchRecord> {
    const res = await apiClient.patch<ApiResponse<SavedSearchRecord>>(`/saved-searches/${id}`, input);
    return res.data.data!;
  },

  async deleteSavedSearch(id: string): Promise<void> {
    await apiClient.delete<ApiResponse>(`/saved-searches/${id}`);
  },
};
