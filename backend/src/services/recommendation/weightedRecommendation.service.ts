import { PropertySearchSummary } from '@housing-clone/shared';
import { ScoredProperty, UserTargetPreference } from './recommendation.types';

export class WeightedRecommendationService {
  public static calculatePropertyScore(
    property: PropertySearchSummary,
    pref: UserTargetPreference
  ): ScoredProperty {
    let score = 0;
    const reasons: string[] = [];

    // 1. Location Match (Weight: 25%)
    if (pref.localityId && property.locality.id === pref.localityId) {
      score += 25;
      reasons.push(`Matches your preferred locality (${property.locality.name})`);
    } else if (pref.cityId && property.city.id === pref.cityId) {
      score += 18;
      reasons.push(`In your preferred city (${property.city.name})`);
    }

    // 2. Price Match (Weight: 20%)
    const price = property.price || property.rent || 0;
    if (pref.minPrice && pref.maxPrice && price >= pref.minPrice && price <= pref.maxPrice) {
      score += 20;
      reasons.push('Fits directly within your budget range');
    } else if (pref.maxPrice && price <= pref.maxPrice) {
      score += 15;
      reasons.push('Within your maximum price budget');
    }

    // 3. Property Category / Purpose Match (Weight: 20%)
    if (pref.listingPurpose && property.listingPurpose === pref.listingPurpose) {
      score += 10;
      reasons.push(`Matches listing purpose (${property.listingPurpose})`);
    }
    if (pref.propertyCategory && property.propertyCategory === pref.propertyCategory) {
      score += 10;
      reasons.push(`Matches property category (${property.propertyCategory})`);
    }

    // 4. BHK Configuration (Weight: 15%)
    if (pref.bhk && property.bhk === pref.bhk) {
      score += 15;
      reasons.push(`Matches your preferred ${property.bhk} BHK requirement`);
    }

    // 5. Verification & Freshness Boost (Weight: 20%)
    if (property.verificationState === 'VERIFIED') {
      score += 12;
      reasons.push('Verified marketplace property');
    }
    if (property.isFeatured) {
      score += 8;
      reasons.push('Featured priority listing');
    }

    if (reasons.length === 0) {
      reasons.push('Popular verified listing in active marketplace');
      score = 40; // Base score
    }

    return {
      property,
      score: Math.min(100, Math.round(score)),
      reasons,
    };
  }
}
