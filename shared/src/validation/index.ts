import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const idParamSchema = z.object({
  id: z.string().min(1, 'ID parameter is required'),
});

export const slugParamSchema = z.object({
  slug: z.string().min(1, 'Slug parameter is required'),
});

export type PaginationQuery = z.infer<typeof paginationSchema>;
export type IdParam = z.infer<typeof idParamSchema>;
export type SlugParam = z.infer<typeof slugParamSchema>;

export * from './auth.schema';
export * from './search.schema';
export * from './media.schema';
export * from './draft.schema';
export * from './savedSearch.schema';
export * from './enquiry.schema';
export * from './visit.schema';
export * from './admin.schema';
export * from './geocoding.schema';
export * from './recommendation.schema';
export * from './broker.schema';
