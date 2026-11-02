import { IStorageService } from './storage.service.interface';
import { S3StorageService } from './s3Storage.service';
import { LocalStorageService } from './localStorage.service';
import { logger } from '../../utils/logger';

let cachedStorageService: IStorageService | null = null;

export function getStorageService(): IStorageService {
  if (cachedStorageService) {
    return cachedStorageService;
  }

  const provider = (process.env.STORAGE_PROVIDER || '').toLowerCase();

  if (provider === 'local') {
    logger.info('📦 Storage Provider: Local Disk Storage Service enabled');
    cachedStorageService = new LocalStorageService();
    return cachedStorageService;
  }

  if (provider === 's3' || provider === 'aws') {
    logger.info('☁️ Storage Provider: S3-Compatible Object Storage enabled');
    cachedStorageService = new S3StorageService();
    return cachedStorageService;
  }

  // Default behavior: Use S3 if S3_ENDPOINT or AWS region configured, else LocalStorage
  if (process.env.S3_ENDPOINT || process.env.AWS_ACCESS_KEY_ID) {
    logger.info('☁️ Storage Provider: S3-Compatible Object Storage initialized');
    cachedStorageService = new S3StorageService();
    return cachedStorageService;
  }

  logger.info('📦 Storage Provider: Fallback Local Disk Storage initialized');
  cachedStorageService = new LocalStorageService();
  return cachedStorageService;
}
