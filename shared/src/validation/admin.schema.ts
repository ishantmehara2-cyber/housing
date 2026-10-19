import { z } from 'zod';
import { UserStatus, VerificationState, ListingState, Role, PropertyCategory } from '../enums';

export const rejectPropertySchema = z.object({
  status: z.nativeEnum(ListingState),
  rejectionReason: z.string().trim().min(3, 'Rejection reason is required'),
});

export const updatePropertyStatusSchema = z.object({
  status: z.nativeEnum(ListingState),
  rejectionReason: z.string().trim().optional(),
});

export const updateVerificationSchema = z.object({
  verificationState: z.nativeEnum(VerificationState),
  notes: z.string().trim().optional(),
});

export const updateUserStatusSchema = z.object({
  status: z.nativeEnum(UserStatus),
});

export const updateUserRoleSchema = z.object({
  role: z.nativeEnum(Role),
});

export const updateReportStatusSchema = z.object({
  status: z.enum(['PENDING', 'RESOLVED', 'DISMISSED']),
  resolution: z.string().trim().optional(),
});

export const createBrokerSchema = z.object({
  firstName: z.string().trim().min(2, 'First name is required'),
  lastName: z.string().trim().min(2, 'Last name is required'),
  email: z.string().trim().email('Invalid email address'),
  phone: z.string().trim().min(10, 'Phone is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.nativeEnum(Role).default(Role.AGENT),
  agencyName: z.string().trim().optional(),
});

export const createStateSchema = z.object({
  name: z.string().trim().min(2, 'State name is required'),
  code: z.string().trim().min(2, 'State code is required'),
});

export const updateStateSchema = z.object({
  name: z.string().trim().min(2).optional(),
  code: z.string().trim().min(2).optional(),
});

export const createCitySchema = z.object({
  name: z.string().trim().min(2, 'City name is required'),
  slug: z.string().trim().min(2, 'City slug is required'),
  stateId: z.string().min(1, 'State ID is required'),
  latitude: z.number().default(19.076),
  longitude: z.number().default(72.8777),
  isPopular: z.boolean().default(false),
});

export const updateCitySchema = z.object({
  name: z.string().trim().min(2).optional(),
  slug: z.string().trim().min(2).optional(),
  stateId: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  isPopular: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const createLocalitySchema = z.object({
  name: z.string().trim().min(2, 'Locality name is required'),
  slug: z.string().trim().min(2, 'Locality slug is required'),
  cityId: z.string().min(1, 'City ID is required'),
  pincode: z.string().trim().optional(),
  latitude: z.number().default(19.076),
  longitude: z.number().default(72.8777),
});

export const updateLocalitySchema = z.object({
  name: z.string().trim().min(2).optional(),
  slug: z.string().trim().min(2).optional(),
  cityId: z.string().optional(),
  pincode: z.string().trim().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const createSubLocalitySchema = z.object({
  name: z.string().trim().min(2, 'Sub-locality name is required'),
  slug: z.string().trim().min(2, 'Sub-locality slug is required'),
  localityId: z.string().min(1, 'Locality ID is required'),
  latitude: z.number().default(19.076),
  longitude: z.number().default(72.8777),
});

export const updateSubLocalitySchema = z.object({
  name: z.string().trim().min(2).optional(),
  slug: z.string().trim().min(2).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const createPropertyTypeSchema = z.object({
  name: z.string().trim().min(2, 'Name is required'),
  slug: z.string().trim().min(2, 'Slug is required'),
  category: z.nativeEnum(PropertyCategory),
  icon: z.string().trim().optional(),
});

export const createAmenitySchema = z.object({
  name: z.string().trim().min(2, 'Name is required'),
  slug: z.string().trim().min(2, 'Slug is required'),
  category: z.string().trim().default('GENERAL'),
  icon: z.string().trim().optional(),
});

export const toggleFeatureFlagSchema = z.object({
  isEnabled: z.boolean(),
});

export const updateSystemSettingSchema = z.object({
  key: z.string().min(1),
  value: z.string().min(1),
});

export const upsertCMSContentSchema = z.object({
  slug: z.string().trim().min(2),
  title: z.string().trim().min(2),
  content: z.string().trim().min(5),
  metaTitle: z.string().trim().optional(),
  metaDesc: z.string().trim().optional(),
});

export type RejectPropertyInput = z.infer<typeof rejectPropertySchema>;
export type UpdatePropertyStatusInput = z.infer<typeof updatePropertyStatusSchema>;
export type UpdateVerificationInput = z.infer<typeof updateVerificationSchema>;
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type UpdateReportStatusInput = z.infer<typeof updateReportStatusSchema>;
export type CreateBrokerInput = z.infer<typeof createBrokerSchema>;
export type CreateStateInput = z.infer<typeof createStateSchema>;
export type UpdateStateInput = z.infer<typeof updateStateSchema>;
export type CreateCityInput = z.infer<typeof createCitySchema>;
export type UpdateCityInput = z.infer<typeof updateCitySchema>;
export type CreateLocalityInput = z.infer<typeof createLocalitySchema>;
export type UpdateLocalityInput = z.infer<typeof updateLocalitySchema>;
export type CreateSubLocalityInput = z.infer<typeof createSubLocalitySchema>;
export type UpdateSubLocalityInput = z.infer<typeof updateSubLocalitySchema>;
export type CreatePropertyTypeInput = z.infer<typeof createPropertyTypeSchema>;
export type CreateAmenityInput = z.infer<typeof createAmenitySchema>;
export type ToggleFeatureFlagInput = z.infer<typeof toggleFeatureFlagSchema>;
export type UpdateSystemSettingInput = z.infer<typeof updateSystemSettingSchema>;
export type UpsertCMSContentInput = z.infer<typeof upsertCMSContentSchema>;
