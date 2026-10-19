import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { IStorageService } from './storage.service.interface';
import { logger } from '../../utils/logger';

export class S3StorageService implements IStorageService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    const endpoint = process.env.S3_ENDPOINT;
    const region = process.env.S3_REGION || 'us-east-1';
    const accessKeyId = process.env.S3_ACCESS_KEY_ID || 'minioadmin';
    const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY || 'minioadmin';

    this.bucketName = process.env.S3_BUCKET_NAME || 'housing-media';

    this.s3Client = new S3Client({
      region,
      endpoint: endpoint || undefined,
      forcePathStyle: Boolean(endpoint), // Required for MinIO path-style S3 buckets
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  public async createPresignedUploadUrl(params: {
    objectKey: string;
    contentType: string;
    expiresInSeconds?: number;
  }): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: params.objectKey,
      ContentType: params.contentType,
    });

    return getSignedUrl(this.s3Client, command, {
      expiresIn: params.expiresInSeconds || 900, // Default 15 minutes
    });
  }

  public async createPresignedDownloadUrl(params: {
    objectKey: string;
    expiresInSeconds?: number;
  }): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: params.objectKey,
    });

    return getSignedUrl(this.s3Client, command, {
      expiresIn: params.expiresInSeconds || 300, // Default 5 minutes
    });
  }

  public async deleteObject(objectKey: string): Promise<boolean> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: objectKey,
      });
      await this.s3Client.send(command);
      return true;
    } catch (err) {
      logger.error({ err, objectKey }, 'Failed to delete object from S3 storage');
      return false;
    }
  }

  public async checkObjectExists(objectKey: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: objectKey,
      });
      await this.s3Client.send(command);
      return true;
    } catch {
      return false;
    }
  }
}
