import { z } from 'zod';
import {
  ListingPurpose,
  PropertyCategory,
  Furnishing,
  Facing,
  PropertyAge,
  PossessionStatus,
  AreaUnit,
  Role,
} from '../enums';

export const createDraftSchema = z.object({
  listingPurpose: z.nativeEnum(ListingPurpose),
  propertyCategory: z.nativeEnum(PropertyCategory),
  propertyTypeId: z.string().min(1, 'Property type is required'),
});

export const updateDraftSchema = z.object({
  title: z.string().trim().min(5).optional(),
  description: z.string().trim().optional(),
  listingPurpose: z.nativeEnum(ListingPurpose).optional(),
  propertyCategory: z.nativeEnum(PropertyCategory).optional(),
  propertyTypeId: z.string().optional(),
  projectId: z.string().nullable().optional(),
  developerOrganizationId: z.string().nullable().optional(),

  bhk: z.number().int().min(0).nullable().optional(),
  bedrooms: z.number().int().min(0).nullable().optional(),
  bathrooms: z.number().int().min(0).nullable().optional(),
  balconies: z.number().int().min(0).nullable().optional(),
  carpetArea: z.number().min(0).optional(),
  builtUpArea: z.number().min(0).nullable().optional(),
  plotArea: z.number().min(0).nullable().optional(),
  areaUnit: z.nativeEnum(AreaUnit).optional(),

  price: z.number().min(0).nullable().optional(),
  rent: z.number().min(0).nullable().optional(),
  securityDeposit: z.number().min(0).nullable().optional(),
  maintenanceFee: z.number().min(0).nullable().optional(),

  furnishing: z.nativeEnum(Furnishing).optional(),
  floorNumber: z.number().int().min(0).nullable().optional(),
  totalFloors: z.number().int().min(0).nullable().optional(),
  parkingSpaces: z.number().int().min(0).optional(),
  facing: z.nativeEnum(Facing).nullable().optional(),
  propertyAge: z.nativeEnum(PropertyAge).nullable().optional(),
  possessionStatus: z.nativeEnum(PossessionStatus).nullable().optional(),
  possessionDate: z.string().nullable().optional(),

  address: z.string().trim().optional(),
  cityId: z.string().optional(),
  localityId: z.string().optional(),
  subLocalityId: z.string().nullable().optional(),
  landmark: z.string().trim().nullable().optional(),
  pincode: z.string().trim().nullable().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),

  amenityIds: z.array(z.string()).optional(),
  completedStep: z.number().int().min(1).max(7).optional(),
  postedByRole: z.nativeEnum(Role).optional(),
});

export type CreateDraftInput = z.infer<typeof createDraftSchema>;
export type UpdateDraftInput = z.infer<typeof updateDraftSchema>;
