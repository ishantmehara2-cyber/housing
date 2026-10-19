import { z } from 'zod';
import {
  ListingPurpose,
  PropertyCategory,
  Furnishing,
  Facing,
  PropertyAge,
  PossessionStatus,
  VerificationState,
  ListingState,
} from '../enums';

export const searchSortOptions = [
  'relevance',
  'newest',
  'price_asc',
  'price_desc',
  'area_asc',
  'area_desc',
] as const;

export const propertySearchSchema = z
  .object({
    q: z.string().trim().optional(),
    state: z.string().trim().optional(),
    city: z.string().trim().optional(),
    locality: z.string().trim().optional(),
    subLocality: z.string().trim().optional(),
    landmark: z.string().trim().optional(),
    project: z.string().trim().optional(),
    developer: z.string().trim().optional(),

    listingPurpose: z.nativeEnum(ListingPurpose).optional(),
    propertyCategory: z.nativeEnum(PropertyCategory).optional(),
    propertyType: z.string().trim().optional(),

    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    minRent: z.coerce.number().min(0).optional(),
    maxRent: z.coerce.number().min(0).optional(),

    bhk: z.coerce.number().int().min(0).optional(),
    bedrooms: z.coerce.number().int().min(0).optional(),
    bathrooms: z.coerce.number().int().min(0).optional(),
    balconies: z.coerce.number().int().min(0).optional(),

    minCarpetArea: z.coerce.number().min(0).optional(),
    maxCarpetArea: z.coerce.number().min(0).optional(),

    furnishing: z.nativeEnum(Furnishing).optional(),
    facing: z.nativeEnum(Facing).optional(),
    propertyAge: z.nativeEnum(PropertyAge).optional(),
    possessionStatus: z.nativeEnum(PossessionStatus).optional(),

    amenities: z.string().trim().optional(),
    amenityMode: z.enum(['all', 'any']).default('all').optional(),

    verificationState: z.nativeEnum(VerificationState).optional(),
    listingState: z.nativeEnum(ListingState).default(ListingState.ACTIVE).optional(),

    postedAfter: z.string().datetime().optional(),
    postedBefore: z.string().datetime().optional(),

    minLat: z.coerce.number().min(-90).max(90).optional(),
    maxLat: z.coerce.number().min(-90).max(90).optional(),
    minLng: z.coerce.number().min(-180).max(180).optional(),
    maxLng: z.coerce.number().min(-180).max(180).optional(),

    sortBy: z.enum(searchSortOptions).optional(),
    page: z.coerce.number().int().positive().default(1).optional(),
    limit: z.coerce.number().int().positive().max(50).default(20).optional(),
  })
  .refine(
    (data) => {
      if (data.minPrice !== undefined && data.maxPrice !== undefined) {
        return data.minPrice <= data.maxPrice;
      }
      return true;
    },
    {
      message: 'minPrice cannot be greater than maxPrice',
      path: ['minPrice'],
    }
  );

export type PropertySearchQuery = z.infer<typeof propertySearchSchema>;
