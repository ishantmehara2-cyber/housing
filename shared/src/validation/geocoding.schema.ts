import { z } from 'zod';

export const geocodingSearchSchema = z.object({
  q: z.string().trim().min(2, 'Search query must be at least 2 characters'),
});

export const reverseGeocodingSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
});

export const mapBoundsSchema = z.object({
  minLat: z.coerce.number().min(-90).max(90),
  maxLat: z.coerce.number().min(-90).max(90),
  minLng: z.coerce.number().min(-180).max(180),
  maxLng: z.coerce.number().min(-180).max(180),
});

export const radiusSearchSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radiusKm: z.coerce.number().positive().max(500).default(10),
});

export type GeocodingSearchQuery = z.infer<typeof geocodingSearchSchema>;
export type ReverseGeocodingQuery = z.infer<typeof reverseGeocodingSchema>;
export type MapBoundsQuery = z.infer<typeof mapBoundsSchema>;
export type RadiusSearchQuery = z.infer<typeof radiusSearchSchema>;
