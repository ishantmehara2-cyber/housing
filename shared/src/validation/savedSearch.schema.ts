import { z } from 'zod';

export const createSavedSearchSchema = z.object({
  name: z.string().trim().max(100).optional(),
  searchCriteria: z.record(z.unknown()),
  enableAlerts: z.boolean().default(true),
});

export const updateSavedSearchSchema = z.object({
  name: z.string().trim().max(100).optional(),
  enableAlerts: z.boolean().optional(),
});

export type CreateSavedSearchInput = z.infer<typeof createSavedSearchSchema>;
export type UpdateSavedSearchInput = z.infer<typeof updateSavedSearchSchema>;
