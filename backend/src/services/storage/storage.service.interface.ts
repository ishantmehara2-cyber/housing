export interface IStorageService {
  createPresignedUploadUrl(params: { objectKey: string; contentType: string; expiresInSeconds?: number }): Promise<string>;
  createPresignedDownloadUrl(params: { objectKey: string; expiresInSeconds?: number }): Promise<string>;
  deleteObject(objectKey: string): Promise<boolean>;
  checkObjectExists(objectKey: string): Promise<boolean>;
}
