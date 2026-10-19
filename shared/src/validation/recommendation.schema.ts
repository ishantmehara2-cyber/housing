import { z } from 'zod';
import { ListingPurpose, PropertyCategory } from '../enums';

export const updatePreferencesSchema = z.object({
  preferredCityId: z.string().optional(),
  preferredLocalityId: z.string().optional(),
  preferredListingPurpose: z.nativeEnum(ListingPurpose).optional(),
  preferredPropertyCategory: z.nativeEnum(PropertyCategory).optional(),
  preferredBhk: z.number().int().min(0).max(10).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  preferredAmenities: z.array(z.string()).optional(),
});

export const recommendationFeedbackSchema = z.object({
  propertyId: z.string().min(1, 'Property ID is required'),
  feedback: z.enum(['NOT_INTERESTED', 'MORE_LIKE_THIS']),
});

export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
export type RecommendationFeedbackInput = z.infer<typeof recommendationFeedbackSchema>;
