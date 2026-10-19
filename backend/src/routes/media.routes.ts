import express, { Router } from 'express';
import { MediaController } from '../controllers/media.controller';
import { requireAuth } from '../middlewares/auth.middleware';

export const mediaRouter = Router();

mediaRouter.post('/presign', requireAuth, MediaController.requestPresignedUpload);
mediaRouter.post('/complete', requireAuth, MediaController.completeUpload);
mediaRouter.put('/upload-local', express.raw({ type: '*/*', limit: '50mb' }), MediaController.uploadLocal);
mediaRouter.delete('/:id', requireAuth, MediaController.deleteMedia);
mediaRouter.get('/:id/download', requireAuth, MediaController.getPrivateDownloadUrl);
mediaRouter.patch('/reorder', requireAuth, MediaController.reorderMedia);
