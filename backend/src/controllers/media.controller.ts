import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import {
  presignMediaSchema,
  completeUploadSchema,
  reorderMediaSchema,
  idParamSchema,
  ApiResponse,
  PropertyMediaSummary,
  ProjectMediaSummary,
} from '@housing-clone/shared';
import { MediaService } from '../services/media.service';
import { PresignedUploadResponse, PresignedDownloadResponse } from '../services/storage/storage.types';
import { AppError } from '../middlewares/errorHandler';

export class MediaController {
  public static async requestPresignedUpload(
    req: Request,
    res: Response<ApiResponse<PresignedUploadResponse>>,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const input = presignMediaSchema.parse(req.body);
      const result = await MediaService.requestPresignedUpload(req.user.id, req.user.role, input);

      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  public static async completeUpload(
    req: Request,
    res: Response<ApiResponse<PropertyMediaSummary | ProjectMediaSummary>>,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const input = completeUploadSchema.parse(req.body);
      const result = await MediaService.completeUpload(req.user.id, req.user.role, input);

      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  public static async uploadLocal(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const objectKey = req.query.objectKey as string;
      if (!objectKey) throw new AppError(400, 'objectKey query parameter is required', 'VALIDATION_ERROR');

      const uploadsDir = path.join(process.cwd(), 'public/uploads');
      const targetPath = path.join(uploadsDir, objectKey);
      const parentDir = path.dirname(targetPath);

      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }

      fs.writeFileSync(targetPath, req.body as Buffer);

      res.status(200).json({ success: true, message: 'Local upload complete' });
    } catch (err) {
      next(err);
    }
  }

  public static async deleteMedia(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const { id } = idParamSchema.parse(req.params);
      await MediaService.deleteMedia(req.user.id, req.user.role, id);

      res.status(200).json({ success: true, message: 'Media deleted successfully' });
    } catch (err) {
      next(err);
    }
  }

  public static async getPrivateDownloadUrl(
    req: Request,
    res: Response<ApiResponse<PresignedDownloadResponse>>,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const { id } = idParamSchema.parse(req.params);
      const result = await MediaService.getPrivateDownloadUrl(req.user.id, req.user.role, id);

      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  public static async reorderMedia(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const input = reorderMediaSchema.parse(req.body);
      await MediaService.reorderMedia(req.user.id, req.user.role, input);

      res.status(200).json({ success: true, message: 'Media reordered successfully' });
    } catch (err) {
      next(err);
    }
  }
}
