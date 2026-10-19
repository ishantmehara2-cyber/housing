import crypto from 'crypto';
import path from 'path';
import {
  MediaType,
  Role,
  PresignMediaInput,
  CompleteUploadInput,
  ReorderMediaInput,
  PropertyMediaSummary,
  ProjectMediaSummary,
} from '@housing-clone/shared';
import { db } from '../config/db';
import { AppError } from '../middlewares/errorHandler';
import { getStorageService } from './storage/storageFactory';
import { PresignedUploadResponse, PresignedDownloadResponse } from './storage/storage.types';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_DOCUMENT_SIZE = 20 * 1024 * 1024; // 20MB

const ALLOWED_MIME_TYPES: Record<MediaType, string[]> = {
  IMAGE: ['image/jpeg', 'image/png', 'image/webp'],
  VIDEO: ['video/mp4', 'video/webm'],
  FLOOR_PLAN: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  DOCUMENT_PDF: ['application/pdf'],
  VIRTUAL_TOUR: ['image/jpeg', 'image/png', 'image/webp'],
};

export class MediaService {
  private static validateFileTypeAndSize(mediaType: MediaType, contentType: string, fileSize: number): void {
    const allowedMimes = ALLOWED_MIME_TYPES[mediaType] || [];
    if (!allowedMimes.includes(contentType)) {
      throw new AppError(400, `Invalid file format ${contentType} for media type ${mediaType}`, 'INVALID_FILE_TYPE');
    }

    let maxAllowed = MAX_IMAGE_SIZE;
    if (mediaType === 'VIDEO') maxAllowed = MAX_VIDEO_SIZE;
    if (mediaType === 'DOCUMENT_PDF' || mediaType === 'FLOOR_PLAN') maxAllowed = MAX_DOCUMENT_SIZE;

    if (fileSize > maxAllowed) {
      throw new AppError(400, `File size exceeds maximum allowed limit of ${maxAllowed / (1024 * 1024)}MB`, 'FILE_TOO_LARGE');
    }
  }

  public static async verifyResourceAuthorization(
    userId: string,
    userRole: Role,
    resourceType: 'PROPERTY' | 'PROJECT',
    resourceId: string
  ): Promise<void> {
    if (userRole === Role.ADMIN || userRole === Role.SUPER_ADMIN) {
      return; // Admins have full access
    }

    if (userRole === Role.TENANT_BUYER || userRole === Role.VISITOR) {
      throw new AppError(403, 'Users with this role cannot manage media', 'FORBIDDEN');
    }

    if (resourceType === 'PROPERTY') {
      const property = await db.property.findUnique({ where: { id: resourceId } });
      if (!property) {
        throw new AppError(404, 'Property not found', 'NOT_FOUND');
      }

      const isOwner = property.ownerId === userId || property.postedByUserId === userId;
      const isAssignedAgent = property.assignedAgentId === userId;

      if (!isOwner && !isAssignedAgent) {
        throw new AppError(403, 'You are not authorized to manage media for this property', 'FORBIDDEN');
      }
    } else if (resourceType === 'PROJECT') {
      const project = await db.project.findUnique({ where: { id: resourceId } });
      if (!project) {
        throw new AppError(404, 'Project not found', 'NOT_FOUND');
      }

      const membership = await db.developerMember.findUnique({
        where: {
          developerOrganizationId_userId: {
            developerOrganizationId: project.developerOrganizationId,
            userId,
          },
        },
      });

      if (!membership) {
        throw new AppError(403, 'You are not authorized to manage media for this project', 'FORBIDDEN');
      }
    }
  }

  public static async requestPresignedUpload(
    userId: string,
    userRole: Role,
    input: PresignMediaInput
  ): Promise<PresignedUploadResponse> {
    await MediaService.verifyResourceAuthorization(userId, userRole, input.resourceType, input.resourceId);
    MediaService.validateFileTypeAndSize(input.mediaType, input.contentType, input.fileSize);

    const ext = path.extname(input.fileName).toLowerCase() || (input.contentType === 'application/pdf' ? '.pdf' : '.jpg');
    const safeUUID = crypto.randomUUID();
    const folder = input.resourceType === 'PROPERTY' ? `properties/${input.resourceId}` : `projects/${input.resourceId}`;
    const objectKey = `${folder}/${input.mediaType.toLowerCase()}/${safeUUID}${ext}`;

    const storage = getStorageService();
    const uploadUrl = await storage.createPresignedUploadUrl({
      objectKey,
      contentType: input.contentType,
      expiresInSeconds: 900,
    });

    const uploadId = `upload_${safeUUID}`;

    return {
      uploadId,
      objectKey,
      uploadUrl,
      expiresIn: 900,
    };
  }

  public static async completeUpload(
    userId: string,
    userRole: Role,
    input: CompleteUploadInput
  ): Promise<PropertyMediaSummary | ProjectMediaSummary> {
    await MediaService.verifyResourceAuthorization(userId, userRole, input.resourceType, input.resourceId);

    if (input.resourceType === 'PROPERTY') {
      const count = await db.propertyMedia.count({ where: { propertyId: input.resourceId } });
      const record = await db.propertyMedia.create({
        data: {
          propertyId: input.resourceId,
          mediaType: input.mediaType as unknown as import('@prisma/client').MediaType,
          url: input.url,
          thumbnailUrl: input.thumbnailUrl || input.url,
          caption: input.caption,
          displayOrder: count + 1,
          fileSizeBytes: input.fileSize,
          mimeType: input.mimeType,
        },
      });

      return {
        id: record.id,
        mediaType: record.mediaType as unknown as MediaType,
        url: record.url,
        thumbnailUrl: record.thumbnailUrl,
        caption: record.caption,
        displayOrder: record.displayOrder,
        fileSizeBytes: record.fileSizeBytes,
        mimeType: record.mimeType,
      };
    } else {
      const count = await db.projectMedia.count({ where: { projectId: input.resourceId } });
      const record = await db.projectMedia.create({
        data: {
          projectId: input.resourceId,
          mediaType: input.mediaType as unknown as import('@prisma/client').MediaType,
          url: input.url,
          caption: input.caption,
          displayOrder: count + 1,
        },
      });

      return {
        id: record.id,
        mediaType: record.mediaType as unknown as MediaType,
        url: record.url,
        caption: record.caption,
        displayOrder: record.displayOrder,
      };
    }
  }

  public static async deleteMedia(userId: string, userRole: Role, mediaId: string): Promise<boolean> {
    const propMedia = await db.propertyMedia.findUnique({ where: { id: mediaId }, include: { property: true } });

    if (propMedia) {
      await MediaService.verifyResourceAuthorization(userId, userRole, 'PROPERTY', propMedia.propertyId);
      await db.propertyMedia.delete({ where: { id: mediaId } });
      return true;
    }

    const projMedia = await db.projectMedia.findUnique({ where: { id: mediaId }, include: { project: true } });

    if (projMedia) {
      await MediaService.verifyResourceAuthorization(userId, userRole, 'PROJECT', projMedia.projectId);
      await db.projectMedia.delete({ where: { id: mediaId } });
      return true;
    }

    throw new AppError(404, 'Media record not found', 'NOT_FOUND');
  }

  public static async getPrivateDownloadUrl(userId: string, userRole: Role, mediaId: string): Promise<PresignedDownloadResponse> {
    const propMedia = await db.propertyMedia.findUnique({ where: { id: mediaId }, include: { property: true } });

    if (!propMedia) {
      throw new AppError(404, 'Media record not found', 'NOT_FOUND');
    }

    await MediaService.verifyResourceAuthorization(userId, userRole, 'PROPERTY', propMedia.propertyId);

    const storage = getStorageService();
    const downloadUrl = await storage.createPresignedDownloadUrl({
      objectKey: propMedia.url,
      expiresInSeconds: 300,
    });

    return {
      downloadUrl,
      expiresIn: 300,
    };
  }

  public static async reorderMedia(userId: string, userRole: Role, input: ReorderMediaInput): Promise<boolean> {
    await MediaService.verifyResourceAuthorization(userId, userRole, input.resourceType, input.resourceId);

    if (input.resourceType === 'PROPERTY') {
      await db.$transaction(
        input.mediaItems.map((item) =>
          db.propertyMedia.update({
            where: { id: item.id },
            data: { displayOrder: item.displayOrder },
          })
        )
      );
    } else {
      await db.$transaction(
        input.mediaItems.map((item) =>
          db.projectMedia.update({
            where: { id: item.id },
            data: { displayOrder: item.displayOrder },
          })
        )
      );
    }

    return true;
  }
}
