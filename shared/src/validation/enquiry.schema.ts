import { z } from 'zod';
import { LeadStatus } from '../enums';

export const createEnquirySchema = z.object({
  propertyId: z.string().min(1, 'Property ID is required'),
  name: z.string().trim().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid 10-digit phone is required'),
  message: z.string().trim().min(5, 'Message must be at least 5 characters'),
  source: z.string().default('WEB'),
});

export const updateLeadStatusSchema = z.object({
  status: z.nativeEnum(LeadStatus),
  notes: z.string().trim().optional(),
});

export type CreateEnquiryInput = z.infer<typeof createEnquirySchema>;
export type UpdateLeadStatusInput = z.infer<typeof updateLeadStatusSchema>;
