import { MediaType } from '@housing-clone/shared';

export type ResourceType = 'PROPERTY' | 'PROJECT';

export interface PresignedUploadRequest {
  resourceType: ResourceType;
  resourceId: string;
  mediaType: MediaType;
  fileName: string;
  contentType: string;
  fileSize: number;
}

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
