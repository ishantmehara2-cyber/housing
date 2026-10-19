import { Prisma } from '@prisma/client';
import {
  PropertySearchQuery,
  PropertySearchResponse,
  PropertySearchSummary,
  PropertyCategory,
  ListingPurpose,
  AreaUnit,
  Furnishing,
  VerificationState,
  ListingState,
  MediaType,
} from '@housing-clone/shared';
import { db } from '../../config/db';
import { ISearchService } from './search.service.interface';

export class MySqlPropertySearchService implements ISearchService {
  public async searchProperties(query: PropertySearchQuery): Promise<PropertySearchResponse> {
    const where: Prisma.PropertyWhereInput = {};

    // 1. Listing State & Verification State
    where.listingState = (query.listingState as unknown as import('@prisma/client').ListingState) || 'ACTIVE';
    if (query.verificationState) {
      where.verificationState = query.verificationState as unknown as import('@prisma/client').VerificationState;
    }

    // 2. Listing Purpose & Categories
    if (query.listingPurpose) {
      where.listingPurpose = query.listingPurpose as unknown as import('@prisma/client').ListingPurpose;
    }
    if (query.propertyCategory) {
      where.propertyCategory = query.propertyCategory as unknown as import('@prisma/client').PropertyCategory;
    }
    if (query.propertyType) {
      const typeSlugs = query.propertyType.split(',').map((s) => s.trim());
      where.propertyType = { slug: { in: typeSlugs } };
    }

    // 3. Location Hierarchy
    if (query.state) {
      where.city = { state: { code: { equals: query.state } } };
    }
    if (query.city) {
      where.city = { slug: query.city.toLowerCase() };
    }
    if (query.locality) {
      where.locality = { slug: query.locality.toLowerCase() };
    }
    if (query.subLocality) {
      where.subLocality = { slug: query.subLocality.toLowerCase() };
    }
    if (query.landmark) {
      where.landmark = { contains: query.landmark };
    }
    if (query.project) {
      where.project = { slug: query.project.toLowerCase() };
    }
    if (query.developer) {
      where.developerOrganization = { slug: query.developer.toLowerCase() };
    }

    // 4. Map Bounding Box
    if (
      query.minLat !== undefined &&
      query.maxLat !== undefined &&
      query.minLng !== undefined &&
      query.maxLng !== undefined
    ) {
      where.latitude = { gte: query.minLat, lte: query.maxLat };
      where.longitude = { gte: query.minLng, lte: query.maxLng };
    }

    // 5. Price & Rent Ranges
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.price = {};
      if (query.minPrice !== undefined) where.price.gte = new Prisma.Decimal(query.minPrice);
      if (query.maxPrice !== undefined) where.price.lte = new Prisma.Decimal(query.maxPrice);
    }
    if (query.minRent !== undefined || query.maxRent !== undefined) {
      where.rent = {};
      if (query.minRent !== undefined) where.rent.gte = new Prisma.Decimal(query.minRent);
      if (query.maxRent !== undefined) where.rent.lte = new Prisma.Decimal(query.maxRent);
    }

    // 6. Property Specifications
    if (query.bhk !== undefined) where.bhk = query.bhk;
    if (query.bedrooms !== undefined) where.bedrooms = query.bedrooms;
    if (query.bathrooms !== undefined) where.bathrooms = query.bathrooms;
    if (query.balconies !== undefined) where.balconies = query.balconies;
    if (query.furnishing) where.furnishing = query.furnishing as unknown as import('@prisma/client').Furnishing;
    if (query.facing) where.facing = query.facing as unknown as import('@prisma/client').Facing;
    if (query.propertyAge) where.propertyAge = query.propertyAge as unknown as import('@prisma/client').PropertyAge;
    if (query.possessionStatus) where.possessionStatus = query.possessionStatus as unknown as import('@prisma/client').PossessionStatus;

    // 7. Area Ranges
    if (query.minCarpetArea !== undefined || query.maxCarpetArea !== undefined) {
      where.carpetArea = {};
      if (query.minCarpetArea !== undefined) where.carpetArea.gte = new Prisma.Decimal(query.minCarpetArea);
      if (query.maxCarpetArea !== undefined) where.carpetArea.lte = new Prisma.Decimal(query.maxCarpetArea);
    }

    // 8. Amenities Filtering
    if (query.amenities) {
      const amenitySlugs = query.amenities.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);

      if (amenitySlugs.length > 0) {
        if (query.amenityMode === 'any') {
          where.amenities = {
            some: {
              amenity: {
                slug: { in: amenitySlugs },
              },
            },
          };
        } else {
          // Default 'all' mode: Property must match ALL requested amenity slugs
          where.AND = [
            ...((where.AND as Prisma.PropertyWhereInput[]) || []),
            ...amenitySlugs.map((slug) => ({
              amenities: {
                some: {
                  amenity: {
                    slug: { equals: slug },
                  },
                },
              },
            })),
          ];
        }
      }
    }

    // 9. Date Filters
    if (query.postedAfter || query.postedBefore) {
      where.createdAt = {};
      if (query.postedAfter) where.createdAt.gte = new Date(query.postedAfter);
      if (query.postedBefore) where.createdAt.lte = new Date(query.postedBefore);
    }

    // 10. Free Text Search Query
    if (query.q) {
      const searchTerm = query.q.trim();
      where.OR = [
        { title: { contains: searchTerm } },
        { description: { contains: searchTerm } },
        { address: { contains: searchTerm } },
        { landmark: { contains: searchTerm } },
        { city: { name: { contains: searchTerm } } },
        { locality: { name: { contains: searchTerm } } },
        { project: { name: { contains: searchTerm } } },
      ];
    }

    // 11. Whitelisted Sorting Strategy
    const orderBy: Prisma.PropertyOrderByWithRelationInput[] = [];

    const effectiveSortBy = query.sortBy || (query.q ? 'relevance' : 'newest');

    switch (effectiveSortBy) {
      case 'price_asc':
        orderBy.push({ price: 'asc' }, { rent: 'asc' }, { id: 'desc' });
        break;
      case 'price_desc':
        orderBy.push({ price: 'desc' }, { rent: 'desc' }, { id: 'desc' });
        break;
      case 'area_asc':
        orderBy.push({ carpetArea: 'asc' }, { id: 'desc' });
        break;
      case 'area_desc':
        orderBy.push({ carpetArea: 'desc' }, { id: 'desc' });
        break;
      case 'relevance':
      case 'newest':
      default:
        orderBy.push({ isFeatured: 'desc' }, { createdAt: 'desc' }, { id: 'desc' });
        break;
    }

    // 12. Pagination Calculation
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    // Execute parallel count and paginated query
    const [properties, total] = await db.$transaction([
      db.property.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          propertyType: true,
          city: true,
          locality: true,
          subLocality: true,
          project: true,
          developerOrganization: true,
          media: {
            where: { mediaType: 'IMAGE' },
            orderBy: { displayOrder: 'asc' },
            take: 1,
          },
        },
      }),
      db.property.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    // Map Prisma property records to clean, safe PropertySearchSummary
    const items: PropertySearchSummary[] = properties.map((p) => MySqlPropertySearchService.mapToSearchSummary(p));

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      appliedFilters: query as unknown as Record<string, unknown>,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static mapToSearchSummary(p: any): PropertySearchSummary {
    const primaryImage = p.media && p.media[0]
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
  }
}
