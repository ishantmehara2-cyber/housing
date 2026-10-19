import { z } from 'zod';
import { VisitStatus } from '../enums';

export const createVisitSchema = z.object({
  propertyId: z.string().min(1, 'Property ID is required'),
  scheduledDate: z.string(),
  timeSlot: z.string().min(1, 'Time slot is required'),
  notes: z.string().trim().optional(),
});

export const updateVisitStatusSchema = z.object({
  status: z.nativeEnum(VisitStatus),
  notes: z.string().trim().optional(),
});

export type CreateVisitInput = z.infer<typeof createVisitSchema>;
export type UpdateVisitStatusInput = z.infer<typeof updateVisitStatusSchema>;
