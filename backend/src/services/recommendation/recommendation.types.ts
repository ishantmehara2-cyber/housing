import { PropertySearchSummary } from '@housing-clone/shared';

export interface ScoredProperty {
  property: PropertySearchSummary;
  score: number; // 0 to 100
  reasons: string[];
}

export interface RecommendationFeedResult {
  algorithmVersion: string;
  items: ScoredProperty[];
  generatedAt: string;
}

export interface UserTargetPreference {
  cityId?: string;
  localityId?: string;
  listingPurpose?: string;
  propertyCategory?: string;
  bhk?: number;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
}
