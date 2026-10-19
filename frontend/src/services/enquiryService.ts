import { apiClient } from './apiClient';
import { ApiResponse, CreateEnquiryInput } from '@housing-clone/shared';

export const enquiryService = {
  async createEnquiry(input: CreateEnquiryInput): Promise<void> {
    await apiClient.post<ApiResponse>('/enquiries', input);
  },
};
