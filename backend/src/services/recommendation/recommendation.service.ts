import { db } from '../../config/db';
import { AppError } from '../../middlewares/errorHandler';
import { PropertySearchSummary, UpdatePreferencesInput, PropertyCategory, ListingPurpose, AreaUnit, Furnishing, VerificationState, ListingState, MediaType } from '@housing-clone/shared';
import { WeightedRecommendationService } from './weightedRecommendation.service';
import { RecommendationFeedResult, ScoredProperty, UserTargetPreference } from './recommendation.types';

export class RecommendationService {
  public static async getPersonalizedFeed(userId?: string, limit = 12): Promise<RecommendationFeedResult> {
    let pref: UserTargetPreference = {};
    const excludedPropertyIds = new Set<string>();

    if (userId) {
      // 1. Fetch user explicit preferences
      const dbPref = await db.userPropertyPreference.findUnique({ where: { userId } });
      if (dbPref) {
        pref = {
          cityId: dbPref.preferredCityId || undefined,
          localityId: dbPref.preferredLocalityId || undefined,
          listingPurpose: dbPref.preferredListingPurpose || undefined,
          propertyCategory: dbPref.preferredPropertyCategory || undefined,
          bhk: dbPref.preferredBhk || undefined,
          minPrice: dbPref.minPrice ? Number(dbPref.minPrice) : undefined,
          maxPrice: dbPref.maxPrice ? Number(dbPref.maxPrice) : undefined,
        };
      }

      // 2. Fetch feedback to exclude NOT_INTERESTED properties
      const feedback = await db.recommendationFeedback.findMany({
        where: { userId, feedback: 'NOT_INTERESTED' },
      });
      feedback.forEach((f) => excludedPropertyIds.add(f.propertyId));

      // 3. Extract implicit signals from recently viewed if explicit pref is missing
      if (!pref.cityId) {
        const recentView = await db.recentlyViewed.findFirst({
          where: { userId },
          include: { property: true },
          orderBy: { viewedAt: 'desc' },
        });
        if (recentView) {
          pref.cityId = recentView.property.cityId;
          pref.listingPurpose = recentView.property.listingPurpose;
        }
      }
    }

    // Candidate retrieval: Active properties
    const activeProperties = await db.property.findMany({
      where: {
        listingState: 'ACTIVE',
        id: { notIn: Array.from(excludedPropertyIds) },
      },
      include: {
        propertyType: true,
        city: true,
        locality: true,
        subLocality: true,
        project: true,
        developerOrganization: true,
        media: { where: { mediaType: 'IMAGE' }, take: 1, orderBy: { displayOrder: 'asc' } },
      },
      take: 50,
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
    });

    const candidateSummaries: PropertySearchSummary[] = activeProperties.map((p) => {
      const primaryImage = p.media[0]
        ? {
            id: p.media[0].id,
            mediaType: p.media[0].mediaType as unknown as MediaType,
            url: p.media[0].url,
            thumbnailUrl: p.media[0].thumbnailUrl,
            caption: p.media[0].caption,
            displayOrder: p.media[0].displayOrder,
            fileSizeBytes: p.media[0].fileSizeBytes,
            mimeType: p.media[0].mimeType,
          }
        : null;

      return {
        id: p.id,
        title: p.title,
        slug: p.slug,
        description: p.description,
        listingPurpose: p.listingPurpose as unknown as ListingPurpose,
        propertyCategory: p.propertyCategory as unknown as PropertyCategory,
        propertyType: {
          id: p.propertyType.id,
          name: p.propertyType.name,
          slug: p.propertyType.slug,
          category: p.propertyType.category as unknown as PropertyCategory,
          icon: p.propertyType.icon,
        },
        price: p.price ? Number(p.price) : null,
        rent: p.rent ? Number(p.rent) : null,
        securityDeposit: p.securityDeposit ? Number(p.securityDeposit) : null,
        maintenanceFee: p.maintenanceFee ? Number(p.maintenanceFee) : null,
        carpetArea: Number(p.carpetArea),
        builtUpArea: p.builtUpArea ? Number(p.builtUpArea) : null,
        plotArea: p.plotArea ? Number(p.plotArea) : null,
        areaUnit: p.areaUnit as unknown as AreaUnit,
        bhk: p.bhk,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        furnishing: p.furnishing as unknown as Furnishing,
        address: p.address,
        city: { id: p.city.id, name: p.city.name, slug: p.city.slug },
        locality: { id: p.locality.id, name: p.locality.name, slug: p.locality.slug },
        subLocality: p.subLocality ? { id: p.subLocality.id, name: p.subLocality.name, slug: p.subLocality.slug } : null,
        project: p.project ? { id: p.project.id, name: p.project.name, slug: p.project.slug } : null,
        developerOrganization: p.developerOrganization
          ? { id: p.developerOrganization.id, companyName: p.developerOrganization.companyName, slug: p.developerOrganization.slug }
          : null,
        primaryImage,
        verificationState: p.verificationState as unknown as VerificationState,
        listingState: p.listingState as unknown as ListingState,
        isFeatured: p.isFeatured,
        isPremium: p.isPremium,
        createdAt: p.createdAt.toISOString(),
        publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
      };
    });

    // Score and rank candidates
    const scored: ScoredProperty[] = candidateSummaries
      .map((p) => WeightedRecommendationService.calculatePropertyScore(p, pref))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return {
      algorithmVersion: 'recommendation-v1',
      items: scored,
      generatedAt: new Date().toISOString(),
    };
  }

  public static async getSimilarProperties(propertyId: string, limit = 4): Promise<ScoredProperty[]> {
    const target = await db.property.findUnique({
      where: { id: propertyId },
      include: { city: true, locality: true },
    });

    if (!target) {
      throw new AppError(404, 'Property not found', 'NOT_FOUND');
    }

    const feed = await RecommendationService.getPersonalizedFeed(undefined, limit + 1);
    return feed.items.filter((item) => item.property.id !== propertyId).slice(0, limit);
  }

  public static async getUserPreferences(userId: string) {
    const pref = await db.userPropertyPreference.findUnique({
      where: { userId },
      include: { preferredCity: true, preferredLocality: true },
    });
    return pref || { userId };
  }

  public static async updateUserPreferences(userId: string, input: UpdatePreferencesInput) {
    return db.userPropertyPreference.upsert({
      where: { userId },
      create: {
        userId,
        preferredCityId: input.preferredCityId,
        preferredLocalityId: input.preferredLocalityId,
        preferredListingPurpose: input.preferredListingPurpose as unknown as import('@prisma/client').ListingPurpose,
        preferredPropertyCategory: input.preferredPropertyCategory as unknown as import('@prisma/client').PropertyCategory,
        preferredBhk: input.preferredBhk,
        minPrice: input.minPrice,
        maxPrice: input.maxPrice,
        preferredAmenities: input.preferredAmenities ? input.preferredAmenities.join(',') : null,
      },
      update: {
        preferredCityId: input.preferredCityId,
        preferredLocalityId: input.preferredLocalityId,
        preferredListingPurpose: input.preferredListingPurpose as unknown as import('@prisma/client').ListingPurpose,
        preferredPropertyCategory: input.preferredPropertyCategory as unknown as import('@prisma/client').PropertyCategory,
        preferredBhk: input.preferredBhk,
        minPrice: input.minPrice,
        maxPrice: input.maxPrice,
        preferredAmenities: input.preferredAmenities ? input.preferredAmenities.join(',') : null,
      },
    });
  }

  public static async recordFeedback(userId: string, propertyId: string, feedback: string) {
    return db.recommendationFeedback.upsert({
      where: { userId_propertyId: { userId, propertyId } },
      create: { userId, propertyId, feedback },
      update: { feedback },
    });
  }
}
