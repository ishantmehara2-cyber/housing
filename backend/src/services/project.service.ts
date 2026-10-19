import {
  ProjectDetail,
  ListingState,
  PossessionStatus,
  VerificationState,
  MediaType,
} from '@housing-clone/shared';
import { db } from '../config/db';
import { AppError } from '../middlewares/errorHandler';

export class ProjectService {
  public static async getProjects(): Promise<ProjectDetail[]> {
    const projects = await db.project.findMany({
      include: {
        developerOrganization: true,
        city: { include: { state: true } },
        locality: true,
        subLocality: true,
        media: { orderBy: { displayOrder: 'asc' } },
        amenities: { include: { amenity: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return projects.map((project) => ({
      id: project.id,
      name: project.name,
      slug: project.slug,
      description: project.description,
      developerOrganization: {
        id: project.developerOrganization.id,
        companyName: project.developerOrganization.companyName,
        slug: project.developerOrganization.slug,
        logoUrl: project.developerOrganization.logoUrl,
        description: project.developerOrganization.description,
        website: project.developerOrganization.website,
        establishedYear: project.developerOrganization.establishedYear,
        verificationStatus: project.developerOrganization.verificationStatus as unknown as VerificationState,
      },
      city: {
        id: project.city.id,
        name: project.city.name,
        slug: project.city.slug,
        state: { id: project.city.state.id, name: project.city.state.name, code: project.city.state.code },
        latitude: project.city.latitude,
        longitude: project.city.longitude,
        isPopular: project.city.isPopular,
        isActive: project.city.isActive,
      },
      locality: {
        id: project.locality.id,
        name: project.locality.name,
        slug: project.locality.slug,
        cityId: project.locality.cityId,
        pincode: project.locality.pincode,
        latitude: project.locality.latitude,
        longitude: project.locality.longitude,
      },
      subLocality: project.subLocality
        ? {
            id: project.subLocality.id,
            name: project.subLocality.name,
            slug: project.subLocality.slug,
            localityId: project.subLocality.localityId,
            latitude: project.subLocality.latitude,
            longitude: project.subLocality.longitude,
          }
        : null,
      address: project.address,
      latitude: project.latitude,
      longitude: project.longitude,
      minPrice: Number(project.minPrice),
      maxPrice: Number(project.maxPrice),
      possessionDate: project.possessionDate ? project.possessionDate.toISOString() : null,
      constructionStatus: project.constructionStatus as unknown as PossessionStatus,
      reraId: project.reraId,
      brochureUrl: project.brochureUrl,
      status: project.status as unknown as ListingState,
      amenities: project.amenities.map((pa) => ({
        id: pa.amenity.id,
        name: pa.amenity.name,
        slug: pa.amenity.slug,
        category: pa.amenity.category,
        icon: pa.amenity.icon,
      })),
      media: project.media.map((pm) => ({
        id: pm.id,
        mediaType: pm.mediaType as unknown as MediaType,
        url: pm.url,
        caption: pm.caption,
        displayOrder: pm.displayOrder,
      })),
      createdAt: project.createdAt.toISOString(),
    }));
  }

  public static async getProjectBySlug(slug: string): Promise<ProjectDetail> {
    const project = await db.project.findUnique({
      where: { slug },
      include: {
        developerOrganization: true,
        city: { include: { state: true } },
        locality: true,
        subLocality: true,
        media: { orderBy: { displayOrder: 'asc' } },
        amenities: { include: { amenity: true } },
      },
    });

    if (!project || project.status === 'REJECTED') {
      throw new AppError(404, 'Project not found', 'PROJECT_NOT_FOUND');
    }

    return {
      id: project.id,
      name: project.name,
      slug: project.slug,
      description: project.description,
      developerOrganization: {
        id: project.developerOrganization.id,
        companyName: project.developerOrganization.companyName,
        slug: project.developerOrganization.slug,
        logoUrl: project.developerOrganization.logoUrl,
        description: project.developerOrganization.description,
        website: project.developerOrganization.website,
        establishedYear: project.developerOrganization.establishedYear,
        verificationStatus: project.developerOrganization.verificationStatus as unknown as VerificationState,
      },
      city: {
        id: project.city.id,
        name: project.city.name,
        slug: project.city.slug,
        state: { id: project.city.state.id, name: project.city.state.name, code: project.city.state.code },
        latitude: project.city.latitude,
        longitude: project.city.longitude,
        isPopular: project.city.isPopular,
        isActive: project.city.isActive,
      },
      locality: {
        id: project.locality.id,
        name: project.locality.name,
        slug: project.locality.slug,
        cityId: project.locality.cityId,
        pincode: project.locality.pincode,
        latitude: project.locality.latitude,
        longitude: project.locality.longitude,
      },
      subLocality: project.subLocality
        ? {
            id: project.subLocality.id,
            name: project.subLocality.name,
            slug: project.subLocality.slug,
            localityId: project.subLocality.localityId,
            latitude: project.subLocality.latitude,
            longitude: project.subLocality.longitude,
          }
        : null,
      address: project.address,
      latitude: project.latitude,
      longitude: project.longitude,
      minPrice: Number(project.minPrice),
      maxPrice: Number(project.maxPrice),
      possessionDate: project.possessionDate ? project.possessionDate.toISOString() : null,
      constructionStatus: project.constructionStatus as unknown as PossessionStatus,
      reraId: project.reraId,
      brochureUrl: project.brochureUrl,
      status: project.status as unknown as ListingState,
      amenities: project.amenities.map((pa) => ({
        id: pa.amenity.id,
        name: pa.amenity.name,
        slug: pa.amenity.slug,
        category: pa.amenity.category,
        icon: pa.amenity.icon,
      })),
      media: project.media.map((pm) => ({
        id: pm.id,
        mediaType: pm.mediaType as unknown as MediaType,
        url: pm.url,
        caption: pm.caption,
        displayOrder: pm.displayOrder,
      })),
      createdAt: project.createdAt.toISOString(),
    };
  }
}
