import {
  PropertyDetail,
  ListingPurpose,
  PropertyCategory,
  AreaUnit,
  Furnishing,
  Facing,
  PropertyAge,
  PossessionStatus,
  VerificationState,
  ListingState,
  MediaType,
  Role,
  UserStatus,
} from '@housing-clone/shared';
import { db } from '../config/db';
import { AppError } from '../middlewares/errorHandler';
import { ProjectService } from './project.service';

export class PropertyService {
  public static async getPropertyBySlug(slug: string): Promise<PropertyDetail> {
    const property = await db.property.findUnique({
      where: { slug },
      include: {
        propertyType: true,
        project: {
          include: {
            developerOrganization: true,
            city: { include: { state: true } },
            locality: true,
            subLocality: true,
            media: { orderBy: { displayOrder: 'asc' } },
            amenities: { include: { amenity: true } },
          },
        },
        developerOrganization: true,
        owner: true,
        postedByUser: true,
        assignedAgent: true,
        city: { include: { state: true } },
        locality: true,
        subLocality: true,
        amenities: { include: { amenity: true } },
        media: { orderBy: { displayOrder: 'asc' } },
      },
    });

    if (!property || property.listingState === 'REJECTED' || (property.listingState === 'DRAFT' && !slug.startsWith('draft-'))) {
      throw new AppError(404, 'Property listing not found', 'PROPERTY_NOT_FOUND');
    }

    // Increment view count asynchronously
    await db.property.update({
      where: { id: property.id },
      data: { viewCount: { increment: 1 } },
    }).catch(() => {});

    const firstImage = property.media.find((m) => m.mediaType === 'IMAGE') || property.media[0];
    const primaryImage = firstImage
      ? {
          id: firstImage.id,
          mediaType: firstImage.mediaType as unknown as MediaType,
          url: firstImage.url,
          thumbnailUrl: firstImage.thumbnailUrl,
          caption: firstImage.caption,
          displayOrder: firstImage.displayOrder,
          fileSizeBytes: firstImage.fileSizeBytes,
          mimeType: firstImage.mimeType,
        }
      : null;

    return {
      id: property.id,
      title: property.title,
      slug: property.slug,
      description: property.description,
      listingPurpose: property.listingPurpose as unknown as ListingPurpose,
      propertyCategory: property.propertyCategory as unknown as PropertyCategory,
      propertyType: {
        id: property.propertyType.id,
        name: property.propertyType.name,
        slug: property.propertyType.slug,
        category: property.propertyType.category as unknown as PropertyCategory,
        icon: property.propertyType.icon,
      },
      project: property.project ? await ProjectService.getProjectBySlug(property.project.slug) : null,
      developerOrganization: property.developerOrganization
        ? {
            id: property.developerOrganization.id,
            companyName: property.developerOrganization.companyName,
            slug: property.developerOrganization.slug,
            logoUrl: property.developerOrganization.logoUrl,
            description: property.developerOrganization.description,
            website: property.developerOrganization.website,
            establishedYear: property.developerOrganization.establishedYear,
            verificationStatus: property.developerOrganization.verificationStatus as unknown as VerificationState,
          }
        : null,
      owner: {
        id: property.owner.id,
        firstName: property.owner.firstName,
        lastName: property.owner.lastName,
        email: property.owner.email,
        phone: property.owner.phone,
        avatarUrl: property.owner.avatarUrl,
        role: property.owner.role as unknown as Role,
        status: property.owner.status as unknown as UserStatus,
        emailVerified: property.owner.emailVerified,
        phoneVerified: property.owner.phoneVerified,
        createdAt: property.owner.createdAt.toISOString(),
      },
      postedByUser: {
        id: property.postedByUser.id,
        firstName: property.postedByUser.firstName,
        lastName: property.postedByUser.lastName,
        email: property.postedByUser.email,
        phone: property.postedByUser.phone,
        avatarUrl: property.postedByUser.avatarUrl,
        role: property.postedByUser.role as unknown as Role,
        status: property.postedByUser.status as unknown as UserStatus,
        emailVerified: property.postedByUser.emailVerified,
        phoneVerified: property.postedByUser.phoneVerified,
        createdAt: property.postedByUser.createdAt.toISOString(),
      },
      assignedAgent: property.assignedAgent
        ? {
            id: property.assignedAgent.id,
            firstName: property.assignedAgent.firstName,
            lastName: property.assignedAgent.lastName,
            email: property.assignedAgent.email,
            phone: property.assignedAgent.phone,
            avatarUrl: property.assignedAgent.avatarUrl,
            role: property.assignedAgent.role as unknown as Role,
            status: property.assignedAgent.status as unknown as UserStatus,
            emailVerified: property.assignedAgent.emailVerified,
            phoneVerified: property.assignedAgent.phoneVerified,
            createdAt: property.assignedAgent.createdAt.toISOString(),
          }
        : null,
      bhk: property.bhk,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      balconies: property.balconies,
      carpetArea: Number(property.carpetArea),
      builtUpArea: property.builtUpArea ? Number(property.builtUpArea) : null,
      plotArea: property.plotArea ? Number(property.plotArea) : null,
      areaUnit: property.areaUnit as unknown as AreaUnit,
      price: property.price ? Number(property.price) : null,
      rent: property.rent ? Number(property.rent) : null,
      securityDeposit: property.securityDeposit ? Number(property.securityDeposit) : null,
      maintenanceFee: property.maintenanceFee ? Number(property.maintenanceFee) : null,
      furnishing: property.furnishing as unknown as Furnishing,
      floorNumber: property.floorNumber,
      totalFloors: property.totalFloors,
      parkingSpaces: property.parkingSpaces,
      facing: property.facing ? (property.facing as unknown as Facing) : null,
      propertyAge: property.propertyAge ? (property.propertyAge as unknown as PropertyAge) : null,
      possessionStatus: property.possessionStatus ? (property.possessionStatus as unknown as PossessionStatus) : null,
      possessionDate: property.possessionDate ? property.possessionDate.toISOString() : null,
      completedStep: property.completedStep,
      address: property.address,
      city: {
        id: property.city.id,
        name: property.city.name,
        slug: property.city.slug,
        state: { id: property.city.state.id, name: property.city.state.name, code: property.city.state.code },
        latitude: property.city.latitude,
        longitude: property.city.longitude,
        isPopular: property.city.isPopular,
        isActive: property.city.isActive,
      },
      locality: {
        id: property.locality.id,
        name: property.locality.name,
        slug: property.locality.slug,
        cityId: property.locality.cityId,
        pincode: property.locality.pincode,
        latitude: property.locality.latitude,
        longitude: property.locality.longitude,
      },
      subLocality: property.subLocality
        ? {
            id: property.subLocality.id,
            name: property.subLocality.name,
            slug: property.subLocality.slug,
            localityId: property.subLocality.localityId,
            latitude: property.subLocality.latitude,
            longitude: property.subLocality.longitude,
          }
        : null,
      landmark: property.landmark,
      pincode: property.pincode,
      latitude: property.latitude,
      longitude: property.longitude,
      primaryImage,
      verificationState: property.verificationState as unknown as VerificationState,
      listingState: property.listingState as unknown as ListingState,
      isFeatured: property.isFeatured,
      isPremium: property.isPremium,
      viewCount: property.viewCount,
      enquiryCount: property.enquiryCount,
      amenities: property.amenities.map((pa) => ({
        id: pa.amenity.id,
        name: pa.amenity.name,
        slug: pa.amenity.slug,
        category: pa.amenity.category,
        icon: pa.amenity.icon,
      })),
      media: property.media.map((pm) => ({
        id: pm.id,
        mediaType: pm.mediaType as unknown as MediaType,
        url: pm.url,
        thumbnailUrl: pm.thumbnailUrl,
        caption: pm.caption,
        displayOrder: pm.displayOrder,
        fileSizeBytes: pm.fileSizeBytes,
        mimeType: pm.mimeType,
      })),
      createdAt: property.createdAt.toISOString(),
      publishedAt: property.publishedAt ? property.publishedAt.toISOString() : null,
    };
  }
}
