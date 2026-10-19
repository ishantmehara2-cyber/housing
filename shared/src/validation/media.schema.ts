import { z } from 'zod';
import { MediaType } from '../enums';

export const presignMediaSchema = z.object({
  resourceType: z.enum(['PROPERTY', 'PROJECT']),
  resourceId: z.string().min(1, 'Resource ID is required'),
  mediaType: z.nativeEnum(MediaType),
  fileName: z.string().min(1, 'File name is required'),
  contentType: z.string().min(1, 'Content type is required'),
  fileSize: z.number().int().positive('File size must be positive'),
  caption: z.string().max(255).optional(),
});

export const completeUploadSchema = z.object({
  resourceType: z.enum(['PROPERTY', 'PROJECT']),
  resourceId: z.string().min(1, 'Resource ID is required'),
  mediaType: z.nativeEnum(MediaType),
  objectKey: z.string().min(1, 'Object key is required'),
  url: z.string().url('Valid URL is required'),
  thumbnailUrl: z.string().url().optional(),
  caption: z.string().max(255).optional(),
  fileSize: z.number().int().positive().optional(),
  mimeType: z.string().optional(),
});

export const reorderMediaSchema = z.object({
  resourceType: z.enum(['PROPERTY', 'PROJECT']),
  resourceId: z.string().min(1, 'Resource ID is required'),
  mediaItems: z.array(
    z.object({
      id: z.string().min(1),
      displayOrder: z.number().int().min(0),
    })
  ).min(1),
});

export type PresignMediaInput = z.infer<typeof presignMediaSchema>;
export type CompleteUploadInput = z.infer<typeof completeUploadSchema>;
export type ReorderMediaInput = z.infer<typeof reorderMediaSchema>;
