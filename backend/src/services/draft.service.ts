import { Prisma } from '@prisma/client';
import {
  Role,
  CreateDraftInput,
  UpdateDraftInput,
  PropertyDetail,
} from '@housing-clone/shared';
import { db } from '../config/db';
import { AppError } from '../middlewares/errorHandler';
import { PropertyService } from './property.service';
import { AuditService } from './audit.service';

export class DraftService {
  private static checkPostingAuthorization(userRole: Role): void {
    if (userRole === Role.TENANT_BUYER || userRole === Role.VISITOR) {
      throw new AppError(403, 'Tenant/Buyer accounts cannot create property listings', 'FORBIDDEN');
    }
  }

  public static async createDraft(
    userId: string,
    userRole: Role,
    input: CreateDraftInput
  ): Promise<PropertyDetail> {
    DraftService.checkPostingAuthorization(userRole);

    // Fetch property type by ID or slug with fallback
    let propertyType = await db.propertyType.findFirst({
      where: {
        OR: [
          { id: input.propertyTypeId },
          { slug: input.propertyTypeId },
        ],
      },
    });

    if (!propertyType) {
      propertyType = await db.propertyType.findFirst({ where: { category: 'RESIDENTIAL' } });
    }

    if (!propertyType) {
      throw new AppError(404, 'Selected property type does not exist', 'NOT_FOUND');
    }

    // Default location fallback to Mumbai (first city/locality if not selected)
    const defaultCity = await db.city.findFirst({ where: { isActive: true } });
    const defaultLocality = defaultCity ? await db.locality.findFirst({ where: { cityId: defaultCity.id } }) : null;

    if (!defaultCity || !defaultLocality) {
      throw new AppError(500, 'Marketplace location system not initialized', 'INTERNAL_ERROR');
    }

    const tempSlug = `draft-${userId}-${Date.now()}`;

    const draft = await db.property.create({
      data: {
        title: `Draft ${input.listingPurpose} ${propertyType.name}`,
        slug: tempSlug,
        description: 'Draft property listing details in progress',
        listingPurpose: input.listingPurpose as unknown as import('@prisma/client').ListingPurpose,
        propertyCategory: input.propertyCategory as unknown as import('@prisma/client').PropertyCategory,
        propertyTypeId: propertyType.id,
        ownerId: userId,
        postedByUserId: userId,
        postedByRole: userRole as unknown as import('@prisma/client').Role,
        carpetArea: new Prisma.Decimal(500),
        address: defaultLocality.name,
        cityId: defaultCity.id,
        localityId: defaultLocality.id,
        latitude: defaultLocality.latitude,
        longitude: defaultLocality.longitude,
        listingState: 'DRAFT',
        completedStep: 1,
      },
    });

    return PropertyService.getPropertyBySlug(draft.slug);
  }

  public static async getDrafts(userId: string): Promise<PropertyDetail[]> {
    const drafts = await db.property.findMany({
      where: {
        ownerId: userId,
        listingState: 'DRAFT',
      },
      orderBy: { updatedAt: 'desc' },
    });

    const results: PropertyDetail[] = [];
    for (const d of drafts) {
      results.push(await PropertyService.getPropertyBySlug(d.slug));
    }
    return results;
  }

  public static async getDraftById(userId: string, userRole: Role, draftId: string): Promise<PropertyDetail> {
    const draft = await db.property.findUnique({ where: { id: draftId } });

    if (!draft || draft.listingState !== 'DRAFT') {
      throw new AppError(404, 'Draft listing not found', 'NOT_FOUND');
    }

    if (userRole !== Role.ADMIN && userRole !== Role.SUPER_ADMIN && draft.ownerId !== userId && draft.postedByUserId !== userId) {
      throw new AppError(403, 'You do not have permission to access this draft', 'FORBIDDEN');
    }

    return PropertyService.getPropertyBySlug(draft.slug);
  }

  public static async updateDraft(
    userId: string,
    userRole: Role,
    draftId: string,
    input: UpdateDraftInput
  ): Promise<PropertyDetail> {
    const draft = await db.property.findUnique({ where: { id: draftId } });

    if (!draft || draft.listingState !== 'DRAFT') {
      throw new AppError(404, 'Draft listing not found', 'NOT_FOUND');
    }

    if (userRole !== Role.ADMIN && userRole !== Role.SUPER_ADMIN && draft.ownerId !== userId && draft.postedByUserId !== userId) {
      throw new AppError(403, 'You do not have permission to modify this draft', 'FORBIDDEN');
    }

    const updateData: Prisma.PropertyUpdateInput = {};

    if (input.title) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.listingPurpose) updateData.listingPurpose = input.listingPurpose as unknown as import('@prisma/client').ListingPurpose;
    if (input.propertyCategory) updateData.propertyCategory = input.propertyCategory as unknown as import('@prisma/client').PropertyCategory;
    if (input.propertyTypeId) {
      const pType = await db.propertyType.findFirst({
        where: {
          OR: [{ id: input.propertyTypeId }, { slug: input.propertyTypeId }],
        },
      });
      if (pType) {
        updateData.propertyType = { connect: { id: pType.id } };
      }
    }

    if (input.bhk !== undefined) updateData.bhk = input.bhk;
    if (input.bedrooms !== undefined) updateData.bedrooms = input.bedrooms;
    if (input.bathrooms !== undefined) updateData.bathrooms = input.bathrooms;
    if (input.balconies !== undefined) updateData.balconies = input.balconies;

    if (input.carpetArea !== undefined) updateData.carpetArea = new Prisma.Decimal(input.carpetArea);
    if (input.builtUpArea !== undefined) updateData.builtUpArea = input.builtUpArea ? new Prisma.Decimal(input.builtUpArea) : null;
    if (input.plotArea !== undefined) updateData.plotArea = input.plotArea ? new Prisma.Decimal(input.plotArea) : null;
    if (input.areaUnit) updateData.areaUnit = input.areaUnit as unknown as import('@prisma/client').AreaUnit;

    if (input.price !== undefined) updateData.price = input.price ? new Prisma.Decimal(input.price) : null;
    if (input.rent !== undefined) updateData.rent = input.rent ? new Prisma.Decimal(input.rent) : null;
    if (input.securityDeposit !== undefined) updateData.securityDeposit = input.securityDeposit ? new Prisma.Decimal(input.securityDeposit) : null;
    if (input.maintenanceFee !== undefined) updateData.maintenanceFee = input.maintenanceFee ? new Prisma.Decimal(input.maintenanceFee) : null;

    if (input.furnishing) updateData.furnishing = input.furnishing as unknown as import('@prisma/client').Furnishing;
    if (input.floorNumber !== undefined) updateData.floorNumber = input.floorNumber;
    if (input.totalFloors !== undefined) updateData.totalFloors = input.totalFloors;
    if (input.parkingSpaces !== undefined) updateData.parkingSpaces = input.parkingSpaces;
    if (input.facing !== undefined) updateData.facing = input.facing ? (input.facing as unknown as import('@prisma/client').Facing) : null;
    if (input.propertyAge !== undefined) updateData.propertyAge = input.propertyAge ? (input.propertyAge as unknown as import('@prisma/client').PropertyAge) : null;
    if (input.possessionStatus !== undefined) updateData.possessionStatus = input.possessionStatus ? (input.possessionStatus as unknown as import('@prisma/client').PossessionStatus) : null;
    if (input.possessionDate !== undefined) updateData.possessionDate = input.possessionDate ? new Date(input.possessionDate) : null;

    if (input.address) updateData.address = input.address;
    if (input.cityId) updateData.city = { connect: { id: input.cityId } };
    if (input.localityId) updateData.locality = { connect: { id: input.localityId } };
    if (input.subLocalityId !== undefined) {
      updateData.subLocality = input.subLocalityId ? { connect: { id: input.subLocalityId } } : { disconnect: true };
    }
    if (input.landmark !== undefined) updateData.landmark = input.landmark;
    if (input.pincode !== undefined) updateData.pincode = input.pincode;
    if (input.latitude !== undefined) updateData.latitude = input.latitude;
    if (input.longitude !== undefined) updateData.longitude = input.longitude;

    if (input.completedStep !== undefined) updateData.completedStep = input.completedStep;

    // Connect / Disconnect Amenities
    if (input.amenityIds) {
      await db.propertyAmenity.deleteMany({ where: { propertyId: draftId } });
      if (input.amenityIds.length > 0) {
        await db.propertyAmenity.createMany({
          data: input.amenityIds.map((amenityId) => ({
            propertyId: draftId,
            amenityId,
          })),
        });
      }
    }

    const updated = await db.property.update({
      where: { id: draftId },
      data: updateData,
    });

    return PropertyService.getPropertyBySlug(updated.slug);
  }

  public static async deleteDraft(userId: string, userRole: Role, draftId: string): Promise<boolean> {
    const draft = await db.property.findUnique({ where: { id: draftId } });

    if (!draft || draft.listingState !== 'DRAFT') {
      throw new AppError(404, 'Draft listing not found', 'NOT_FOUND');
    }

    if (userRole !== Role.ADMIN && userRole !== Role.SUPER_ADMIN && draft.ownerId !== userId && draft.postedByUserId !== userId) {
      throw new AppError(403, 'You do not have permission to delete this draft', 'FORBIDDEN');
    }

    await db.property.delete({ where: { id: draftId } });
    return true;
  }

  public static async submitDraft(
    userId: string,
    userRole: Role,
    draftId: string,
    ipAddress?: string
  ): Promise<PropertyDetail> {
    const draft = await db.property.findUnique({
      where: { id: draftId },
      include: {
        city: true,
        locality: true,
        propertyType: true,
        media: true,
      },
    });

    if (!draft || draft.listingState !== 'DRAFT') {
      throw new AppError(404, 'Draft listing not found or already submitted', 'NOT_FOUND');
    }

    if (userRole !== Role.ADMIN && userRole !== Role.SUPER_ADMIN && draft.ownerId !== userId && draft.postedByUserId !== userId) {
      throw new AppError(403, 'You do not have permission to submit this draft', 'FORBIDDEN');
    }

    // Validation checks for submission completeness
    if (!draft.title || draft.title.startsWith('Draft ')) {
      throw new AppError(400, 'Please enter a valid property title', 'VALIDATION_ERROR');
    }

    if (draft.media.length === 0) {
      throw new AppError(400, 'Please upload at least one property image before submitting', 'MEDIA_REQUIRED');
    }

    // Generate deterministic SEO-friendly slug
    const bhkPrefix = draft.bhk ? `${draft.bhk}-bhk-` : '';
    const typeSlug = draft.propertyType.slug;
    const locSlug = draft.locality.slug;
    const citySlug = draft.city.slug;
    const uniqueSuffix = draft.id.substring(draft.id.length - 8);
    const seoSlug = `${bhkPrefix}${typeSlug}-in-${locSlug}-${citySlug}-${uniqueSuffix}`.toLowerCase();

    // Execute submission in a single Prisma Database Transaction
    const updated = await db.$transaction(async (tx) => {
      const p = await tx.property.update({
        where: { id: draftId },
        data: {
          slug: seoSlug,
          listingState: 'PENDING_APPROVAL', // Security: Normal users CANNOT set ACTIVE
          verificationState: 'PENDING',    // Security: Normal users CANNOT set VERIFIED
          publishedAt: new Date(),
          completedStep: 7,
        },
      });

      await AuditService.log(
        userId,
        'PROPERTY_SUBMITTED_FOR_APPROVAL',
        'Property',
        p.id,
        { seoSlug, listingState: 'PENDING_APPROVAL' },
        ipAddress
      );

      return p;
    });

    return PropertyService.getPropertyBySlug(updated.slug);
  }
}
