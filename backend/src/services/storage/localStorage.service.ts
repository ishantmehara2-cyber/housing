import fs from 'fs';
import path from 'path';
import { IStorageService } from './storage.service.interface';

export class LocalStorageService implements IStorageService {
  private uploadsDir: string;
  private baseUrl: string;

  constructor() {
    this.uploadsDir = path.join(process.cwd(), 'public/uploads');
    const port = process.env.PORT || 5000;
    this.baseUrl = process.env.PUBLIC_UPLOADS_URL || `http://localhost:${port}/uploads`;

    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  public async createPresignedUploadUrl(params: {
    objectKey: string;
    contentType: string;
    expiresInSeconds?: number;
  }): Promise<string> {
    const port = process.env.PORT || 5000;
    const apiBase = process.env.API_BASE_URL || `http://localhost:${port}/api/v1`;
    return `${apiBase}/media/upload-local?objectKey=${encodeURIComponent(params.objectKey)}`;
  }

  public async createPresignedDownloadUrl(params: {
    objectKey: string;
    expiresInSeconds?: number;
  }): Promise<string> {
    return `${this.baseUrl}/${params.objectKey}`;
  }

  public async deleteObject(objectKey: string): Promise<boolean> {
    try {
      const filePath = path.join(this.uploadsDir, objectKey);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return true;
    } catch {
      return false;
    }
  }

  public async checkObjectExists(objectKey: string): Promise<boolean> {
    const filePath = path.join(this.uploadsDir, objectKey);
    return fs.existsSync(filePath);
  }
}
