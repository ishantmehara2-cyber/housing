import { apiClient } from './apiClient';
import {
  ApiResponse,
  CreateDraftInput,
  UpdateDraftInput,
  PropertyDetail,
} from '@housing-clone/shared';

export const draftService = {
  async createDraft(input: CreateDraftInput): Promise<PropertyDetail> {
    const res = await apiClient.post<ApiResponse<PropertyDetail>>('/properties/drafts', input);
    return res.data.data!;
  },

  async getDrafts(): Promise<PropertyDetail[]> {
    const res = await apiClient.get<ApiResponse<PropertyDetail[]>>('/properties/drafts');
    return res.data.data!;
  },

  async getDraftById(id: string): Promise<PropertyDetail> {
    const res = await apiClient.get<ApiResponse<PropertyDetail>>(`/properties/drafts/${id}`);
    return res.data.data!;
  },

  async updateDraft(id: string, input: UpdateDraftInput): Promise<PropertyDetail> {
    const res = await apiClient.patch<ApiResponse<PropertyDetail>>(`/properties/drafts/${id}`, input);
    return res.data.data!;
  },

  async deleteDraft(id: string): Promise<void> {
    await apiClient.delete<ApiResponse>(`/properties/drafts/${id}`);
  },

  async submitDraft(id: string): Promise<PropertyDetail> {
    const res = await apiClient.post<ApiResponse<PropertyDetail>>(`/properties/drafts/${id}/submit`);
    return res.data.data!;
  },
};
