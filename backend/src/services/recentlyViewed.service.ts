import { db } from '../config/db';
import { PropertySearchSummary, PropertyCategory, ListingPurpose, AreaUnit, Furnishing, VerificationState, ListingState, MediaType } from '@housing-clone/shared';

const MAX_HISTORY_ITEMS = 30;

export class RecentlyViewedService {
  public static async recordView(userId: string, propertyId: string): Promise<boolean> {
    const property = await db.property.findUnique({ where: { id: propertyId } });
    if (!property || property.listingState === 'REJECTED' || property.listingState === 'DRAFT') {
      return false; // Silently ignore invalid properties
    }

    const existing = await db.recentlyViewed.findFirst({
      where: { userId, propertyId },
    });

    if (existing) {
      await db.recentlyViewed.update({
        where: { id: existing.id },
        data: { viewedAt: new Date() },
      });
    } else {
      await db.recentlyViewed.create({
        data: { userId, propertyId, viewedAt: new Date() },
      });
    }

    // Cap history size to 30 items per user
    const totalCount = await db.recentlyViewed.count({ where: { userId } });
    if (totalCount > MAX_HISTORY_ITEMS) {
      const oldest = await db.recentlyViewed.findMany({
        where: { userId },
        orderBy: { viewedAt: 'asc' },
        take: totalCount - MAX_HISTORY_ITEMS,
      });

      if (oldest.length > 0) {
        await db.recentlyViewed.deleteMany({
          where: { id: { in: oldest.map((item) => item.id) } },
        });
      }
    }

    return true;
  }

  public static async getUserHistory(userId: string): Promise<PropertySearchSummary[]> {
    const history = await db.recentlyViewed.findMany({
      where: { userId },
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
      orderBy: { viewedAt: 'desc' },
      take: MAX_HISTORY_ITEMS,
    });

    return history.map((h) => {
      const p = h.property;
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
  }

  public static async deleteItem(userId: string, propertyId: string): Promise<boolean> {
    await db.recentlyViewed.deleteMany({
      where: { userId, propertyId },
    });
    return true;
  }

  public static async clearHistory(userId: string): Promise<boolean> {
    await db.recentlyViewed.deleteMany({
      where: { userId },
    });
    return true;
  }
}
