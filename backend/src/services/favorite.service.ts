import { db } from '../config/db';
import { AppError } from '../middlewares/errorHandler';
import { PropertySearchSummary, PropertyCategory, ListingPurpose, AreaUnit, Furnishing, VerificationState, ListingState, MediaType, SearchPaginationMetadata } from '@housing-clone/shared';

export class FavoriteService {
  public static async addFavorite(userId: string, propertyId: string): Promise<boolean> {
    const property = await db.property.findUnique({ where: { id: propertyId } });
    if (!property || property.listingState === 'REJECTED' || property.listingState === 'DRAFT') {
      throw new AppError(404, 'Property not found', 'NOT_FOUND');
    }

    await db.favorite.upsert({
      where: {
        userId_propertyId: { userId, propertyId },
      },
      create: { userId, propertyId },
      update: {},
    });

    return true;
  }

  public static async removeFavorite(userId: string, propertyId: string): Promise<boolean> {
    await db.favorite.deleteMany({
      where: { userId, propertyId },
    });
    return true;
  }

  public static async isFavorite(userId: string, propertyId: string): Promise<boolean> {
    const fav = await db.favorite.findUnique({
      where: {
        userId_propertyId: { userId, propertyId },
      },
    });
    return Boolean(fav);
  }

  public static async getUserFavorites(
    userId: string,
    page = 1,
    limit = 20
  ): Promise<{ items: PropertySearchSummary[]; pagination: SearchPaginationMetadata }> {
    const skip = (page - 1) * limit;

    const [favorites, total] = await db.$transaction([
      db.favorite.findMany({
        where: { userId },
        skip,
        take: limit,
        include: {
          property: {
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
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      db.favorite.count({ where: { userId } }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    const items: PropertySearchSummary[] = favorites.map((f) => {
      const p = f.property;
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
    };
  }
}
