import axios from 'axios';
import { apiClient } from './apiClient';
import {
  ApiResponse,
  PresignMediaInput,
  CompleteUploadInput,
  PropertyMediaSummary,
  ProjectMediaSummary,
} from '@housing-clone/shared';

export interface PresignedUploadResponse {
  uploadId: string;
  objectKey: string;
  uploadUrl: string;
  expiresIn: number;
}

export interface PresignedDownloadResponse {
  downloadUrl: string;
  expiresIn: number;
}

export const mediaService = {
  async requestPresignedUpload(input: PresignMediaInput): Promise<PresignedUploadResponse> {
    const res = await apiClient.post<ApiResponse<PresignedUploadResponse>>('/media/presign', input);
    return res.data.data!;
  },

  async uploadDirectToStorage(
    uploadUrl: string,
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<void> {
    await axios.put(uploadUrl, file, {
      headers: {
        'Content-Type': file.type,
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });
  },

  async completeUpload(input: CompleteUploadInput): Promise<PropertyMediaSummary | ProjectMediaSummary> {
    const res = await apiClient.post<ApiResponse<PropertyMediaSummary | ProjectMediaSummary>>('/media/complete', input);
    return res.data.data!;
  },

  async deleteMedia(mediaId: string): Promise<void> {
    await apiClient.delete<ApiResponse>(`/media/${mediaId}`);
  },

  async getPrivateDownloadUrl(mediaId: string): Promise<PresignedDownloadResponse> {
    const res = await apiClient.get<ApiResponse<PresignedDownloadResponse>>(`/media/${mediaId}/download`);
    return res.data.data!;
  },
};
