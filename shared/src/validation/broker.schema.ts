import { z } from 'zod';
import { Role } from '../enums';

export const brokerQuerySchema = z.object({
  query: z.string().trim().optional(),
  city: z.string().trim().optional(),
  specialization: z.enum(['BUY', 'RENT', 'BOTH']).optional(),
  role: z.nativeEnum(Role).optional(),
  sortBy: z.enum(['rating', 'experience', 'listings', 'newest']).default('listings'),
  order: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export const contactBrokerSchema = z.object({
  propertyId: z.string().optional(),
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().email('Invalid email address'),
  phone: z.string().trim().min(10, 'Phone number must be at least 10 digits'),
  message: z.string().trim().min(5, 'Message must be at least 5 characters'),
});

export const updateBrokerProfileSchema = z.object({
  firstName: z.string().trim().min(2).optional(),
  lastName: z.string().trim().min(2).optional(),
  phone: z.string().trim().min(10).optional(),
  agencyName: z.string().trim().optional(),
  experienceYears: z.number().int().min(0).optional(),
  city: z.string().trim().optional(),
  description: z.string().trim().optional(),
});

export const resetBrokerPasswordSchema = z.object({
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

export type BrokerQueryInput = z.infer<typeof brokerQuerySchema>;
export type ContactBrokerInput = z.infer<typeof contactBrokerSchema>;
export type UpdateBrokerProfileInput = z.infer<typeof updateBrokerProfileSchema>;
export type ResetBrokerPasswordInput = z.infer<typeof resetBrokerPasswordSchema>;
