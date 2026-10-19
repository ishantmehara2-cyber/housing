import { db } from '../config/db';
import { AppError } from '../middlewares/errorHandler';
import {
  Role,
  ListingState,
  VerificationState,
  UserStatus,
  SearchPaginationMetadata,
  NotificationChannel,
  CreateBrokerInput,
  CreateCityInput,
  CreateLocalityInput,
  CreatePropertyTypeInput,
  CreateAmenityInput,
  UpsertCMSContentInput,
} from '@housing-clone/shared';
import { NotificationService } from './notification/notification.service';
import { AuditService } from './audit.service';
import { PasswordService } from './password.service';
import { Prisma } from '@prisma/client';

export class AdminService {
  public static checkAdminAuthorization(userRole: Role): void {
    if (userRole !== Role.ADMIN && userRole !== Role.SUPER_ADMIN && userRole !== Role.MODERATOR) {
      throw new AppError(403, 'Access denied. Administrative privileges required.', 'FORBIDDEN');
    }
  }

  public static checkSuperAdminAuthorization(userRole: Role): void {
    if (userRole !== Role.SUPER_ADMIN) {
      throw new AppError(403, 'Access denied. Super Admin privileges required.', 'FORBIDDEN');
    }
  }

  public static async getOverviewMetrics(userRole: Role) {
    AdminService.checkAdminAuthorization(userRole);

    const [
      totalUsers,
      activeUsers,
      suspendedUsers,
      totalProps,
      activeProps,
      pendingApprovalProps,
      pendingVerifProps,
      rejectedProps,
      draftProps,
      totalBrokers,
      verifiedBrokers,
      totalDevelopers,
      totalProjects,
      totalLeads,
      totalEnquiries,
      upcomingVisits,
      completedVisits,
      totalTransactions,
      activeSubscriptions,
      totalReports,
      pendingReports,
      recentAuditLogs,
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { status: 'ACTIVE' } }),
      db.user.count({ where: { status: 'SUSPENDED' } }),
      db.property.count(),
      db.property.count({ where: { listingState: 'ACTIVE' } }),
      db.property.count({ where: { listingState: 'PENDING_APPROVAL' } }),
      db.property.count({ where: { verificationState: 'PENDING' } }),
      db.property.count({ where: { listingState: 'REJECTED' } }),
      db.property.count({ where: { listingState: 'DRAFT' } }),
      db.user.count({ where: { role: 'AGENT' } }),
      db.user.count({ where: { role: 'AGENT', emailVerified: true } }),
      db.user.count({ where: { role: 'DEVELOPER' } }),
      db.project.count(),
      db.lead.count(),
      db.enquiry.count(),
      db.propertyVisit.count({ where: { status: 'SCHEDULED' } }),
      db.propertyVisit.count({ where: { status: 'COMPLETED' } }),
      db.transaction.count(),
      db.subscription.count({ where: { status: 'ACTIVE' } }),
      db.report.count(),
      db.report.count({ where: { status: 'PENDING' } }),
      db.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { firstName: true, lastName: true, email: true, role: true } } },
      }),
    ]);

    return {
      userCounts: { total: totalUsers, active: activeUsers, suspended: suspendedUsers },
      propertyCounts: {
        total: totalProps,
        active: activeProps,
        pendingApproval: pendingApprovalProps,
        pendingVerification: pendingVerifProps,
        rejected: rejectedProps,
        draft: draftProps,
      },
      brokerCounts: { total: totalBrokers, verified: verifiedBrokers, developers: totalDevelopers },
      leadCounts: { leads: totalLeads, enquiries: totalEnquiries },
      visitCounts: { upcoming: upcomingVisits, completed: completedVisits },
      monetization: { transactions: totalTransactions, activeSubscriptions },
      reportCounts: { total: totalReports, pending: pendingReports },
      totalProjects,
      recentAuditLogs,
    };
  }

  public static async getProperties(
    userRole: Role,
    page = 1,
    limit = 20,
    listingStateFilter?: string,
    verificationStateFilter?: string
  ): Promise<{ items: unknown[]; pagination: SearchPaginationMetadata }> {
    AdminService.checkAdminAuthorization(userRole);
    const skip = (page - 1) * limit;

    const where: Prisma.PropertyWhereInput = {};
    if (listingStateFilter) {
      where.listingState = listingStateFilter as unknown as import('@prisma/client').ListingState;
    }
    if (verificationStateFilter) {
      where.verificationState = verificationStateFilter as unknown as import('@prisma/client').VerificationState;
    }

    const [items, total] = await db.$transaction([
      db.property.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          propertyType: true,
          city: true,
          locality: true,
          owner: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
          media: { where: { mediaType: 'IMAGE' }, take: 1, orderBy: { displayOrder: 'asc' } },
        },
      }),
      db.property.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items,
      pagination: { page, limit, total, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 },
    };
  }

  public static async updatePropertyStatus(
    adminUserId: string,
    adminRole: Role,
    propertyId: string,
    status: ListingState,
    rejectionReason?: string,
    ipAddress?: string
  ) {
    AdminService.checkAdminAuthorization(adminRole);

    const property = await db.property.findUnique({ where: { id: propertyId } });
    if (!property) {
      throw new AppError(404, 'Property not found', 'NOT_FOUND');
    }

    if (status === 'REJECTED' && !rejectionReason) {
      throw new AppError(400, 'Rejection reason is mandatory when rejecting a property listing', 'VALIDATION_ERROR');
    }

    const updated = await db.property.update({
      where: { id: propertyId },
      data: {
        listingState: status as unknown as import('@prisma/client').ListingState,
        rejectionReason: status === 'REJECTED' ? rejectionReason : null,
      },
    });

    // Notify property owner
    const actionText = status === 'ACTIVE' ? 'APPROVED and published' : 'REJECTED';
    await NotificationService.createNotification(
      property.ownerId,
      `Property Listing ${status}`,
      `Your property "${property.title}" has been ${actionText}.${rejectionReason ? ` Reason: ${rejectionReason}` : ''}`,
      'MODERATION',
      NotificationChannel.IN_APP
    );

    // Audit Log
    const auditAction = status === 'ACTIVE' ? 'PROPERTY_APPROVAL_APPROVED' : 'PROPERTY_APPROVAL_REJECTED';
    await AuditService.log(adminUserId, auditAction, 'Property', propertyId, { status, rejectionReason }, ipAddress);

    return updated;
  }

  public static async getVerificationQueue(userRole: Role, page = 1, limit = 20) {
    AdminService.checkAdminAuthorization(userRole);
    return AdminService.getProperties(userRole, page, limit, undefined, 'PENDING');
  }

  public static async updateVerificationState(
    adminUserId: string,
    adminRole: Role,
    propertyId: string,
    verificationState: VerificationState,
    notes?: string,
    ipAddress?: string
  ) {
    AdminService.checkAdminAuthorization(adminRole);

    const property = await db.property.findUnique({ where: { id: propertyId } });
    if (!property) {
      throw new AppError(404, 'Property not found', 'NOT_FOUND');
    }

    const [updated] = await db.$transaction([
      db.property.update({
        where: { id: propertyId },
        data: { verificationState: verificationState as unknown as import('@prisma/client').VerificationState },
      }),
      db.propertyVerification.create({
        data: {
          propertyId,
          reviewerId: adminUserId,
          status: verificationState as unknown as import('@prisma/client').VerificationState,
          notes,
          reviewedAt: new Date(),
        },
      }),
    ]);

    // Notify owner
    await NotificationService.createNotification(
      property.ownerId,
      'Property Verification Update',
      `Your property "${property.title}" verification status is now ${verificationState}.`,
      'VERIFICATION',
      NotificationChannel.IN_APP
    );

    // Audit Log
    const auditAction = verificationState === 'VERIFIED' ? 'PROPERTY_VERIFICATION_APPROVED' : 'PROPERTY_VERIFICATION_REJECTED';
    await AuditService.log(adminUserId, auditAction, 'Property', propertyId, { verificationState }, ipAddress);

    return updated;
  }

  public static async getUsers(userRole: Role, page = 1, limit = 20, roleFilter?: string, statusFilter?: string) {
    AdminService.checkAdminAuthorization(userRole);
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};
    if (roleFilter) where.role = roleFilter as unknown as import('@prisma/client').Role;
    if (statusFilter) where.status = statusFilter as unknown as import('@prisma/client').UserStatus;

    const [users, total] = await db.$transaction([
      db.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          emailVerified: true,
          phoneVerified: true,
          createdAt: true,
        },
      }),
      db.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items: users,
      pagination: { page, limit, total, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 },
    };
  }

  public static async updateUserStatus(
    adminUserId: string,
    adminRole: Role,
    targetUserId: string,
    status: UserStatus,
    ipAddress?: string
  ) {
    AdminService.checkAdminAuthorization(adminRole);

    const targetUser = await db.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser) {
      throw new AppError(404, 'Target user account not found', 'NOT_FOUND');
    }

    if (targetUser.role === Role.SUPER_ADMIN && adminRole !== Role.SUPER_ADMIN) {
      throw new AppError(403, 'Only SUPER_ADMIN can modify another SUPER_ADMIN account', 'FORBIDDEN');
    }

    const updated = await db.user.update({
      where: { id: targetUserId },
      data: { status: status as unknown as import('@prisma/client').UserStatus },
    });

    const auditAction = status === 'SUSPENDED' ? 'USER_SUSPENDED' : 'USER_REACTIVATED';
    await AuditService.log(adminUserId, auditAction, 'User', targetUserId, { status }, ipAddress);

    return {
      id: updated.id,
      firstName: updated.firstName,
      lastName: updated.lastName,
      email: updated.email,
      role: updated.role,
      status: updated.status,
    };
  }

  public static async updateUserRole(
    adminUserId: string,
    adminRole: Role,
    targetUserId: string,
    newRole: Role,
    ipAddress?: string
  ) {
    AdminService.checkAdminAuthorization(adminRole);

    if ((newRole === Role.ADMIN || newRole === Role.SUPER_ADMIN) && adminRole !== Role.SUPER_ADMIN) {
      throw new AppError(403, 'Only SUPER_ADMIN can assign ADMIN or SUPER_ADMIN roles', 'FORBIDDEN');
    }

    const updated = await db.user.update({
      where: { id: targetUserId },
      data: { role: newRole as unknown as import('@prisma/client').Role },
    });

    await AuditService.log(adminUserId, 'USER_ROLE_CHANGED', 'User', targetUserId, { newRole }, ipAddress);
    return updated;
  }

  public static async createBroker(adminUserId: string, adminRole: Role, input: CreateBrokerInput, ipAddress?: string) {
    AdminService.checkAdminAuthorization(adminRole);

    const passwordHash = await PasswordService.hashPassword(input.password);

    const user = await db.user.create({
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email.toLowerCase().trim(),
        phone: input.phone.trim(),
        passwordHash,
        role: input.role as unknown as import('@prisma/client').Role,
        status: 'ACTIVE',
        emailVerified: true,
        phoneVerified: true,
      },
    });

    await AuditService.log(adminUserId, 'ADMIN_CREATED_BROKER', 'User', user.id, { role: input.role, agencyName: input.agencyName }, ipAddress);
    return user;
  }

  public static async getProjects(userRole: Role, page = 1, limit = 20) {
    AdminService.checkAdminAuthorization(userRole);
    const skip = (page - 1) * limit;

    const [projects, total] = await db.$transaction([
      db.project.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          developerOrganization: true,
          city: true,
          locality: true,
        },
      }),
      db.project.count(),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    return { items: projects, pagination: { page, limit, total, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 } };
  }

  public static async getDevelopers(userRole: Role) {
    AdminService.checkAdminAuthorization(userRole);
    return db.developerOrganization.findMany({
      include: {
        _count: { select: { projects: true, properties: true, members: true } },
      },
    });
  }

  // States Management
  public static async getStates(userRole: Role) {
    AdminService.checkAdminAuthorization(userRole);
    return db.state.findMany({
      include: {
        _count: { select: { cities: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  public static async createState(adminUserId: string, adminRole: Role, input: { name: string; code: string }, ipAddress?: string) {
    AdminService.checkAdminAuthorization(adminRole);
    const state = await db.state.create({
      data: {
        name: input.name,
        code: input.code.toUpperCase(),
      },
    });
    await AuditService.log(adminUserId, 'STATE_CREATED', 'State', state.id, { name: state.name }, ipAddress);
    return state;
  }

  public static async updateState(adminUserId: string, adminRole: Role, stateId: string, input: { name?: string; code?: string }, ipAddress?: string) {
    AdminService.checkAdminAuthorization(adminRole);
    const updated = await db.state.update({
      where: { id: stateId },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.code && { code: input.code.toUpperCase() }),
      },
    });
    await AuditService.log(adminUserId, 'STATE_UPDATED', 'State', stateId, { name: updated.name }, ipAddress);
    return updated;
  }

  // Cities Management
  public static async getCities(userRole: Role, stateId?: string) {
    AdminService.checkAdminAuthorization(userRole);
    const where: Prisma.CityWhereInput = {};
    if (stateId) where.stateId = stateId;

    return db.city.findMany({
      where,
      include: {
        state: true,
        _count: { select: { localities: true, properties: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  public static async createCity(adminUserId: string, adminRole: Role, input: CreateCityInput, ipAddress?: string) {
    AdminService.checkAdminAuthorization(adminRole);
    const city = await db.city.create({
      data: {
        name: input.name,
        slug: input.slug,
        stateId: input.stateId,
        latitude: input.latitude,
        longitude: input.longitude,
        isPopular: input.isPopular,
        isActive: true,
      },
      include: { state: true },
    });
    await AuditService.log(adminUserId, 'CITY_CREATED', 'City', city.id, { name: city.name }, ipAddress);
    return city;
  }

  public static async updateCity(
    adminUserId: string,
    adminRole: Role,
    cityId: string,
    input: { name?: string; slug?: string; stateId?: string; isPopular?: boolean; isActive?: boolean },
    ipAddress?: string
  ) {
    AdminService.checkAdminAuthorization(adminRole);
    const updated = await db.city.update({
      where: { id: cityId },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.slug && { slug: input.slug }),
        ...(input.stateId && { stateId: input.stateId }),
        ...(input.isPopular !== undefined && { isPopular: input.isPopular }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
      },
      include: { state: true },
    });
    await AuditService.log(adminUserId, 'CITY_UPDATED', 'City', cityId, { name: updated.name }, ipAddress);
    return updated;
  }

  // Localities Management
  public static async getLocalities(userRole: Role, cityId?: string) {
    AdminService.checkAdminAuthorization(userRole);
    const where: Prisma.LocalityWhereInput = {};
    if (cityId) where.cityId = cityId;

    return db.locality.findMany({
      where,
      include: {
        city: true,
        _count: { select: { subLocalities: true, properties: true } },
      },
      take: 200,
      orderBy: { name: 'asc' },
    });
  }

  public static async createLocality(adminUserId: string, adminRole: Role, input: CreateLocalityInput, ipAddress?: string) {
    AdminService.checkAdminAuthorization(adminRole);
    const locality = await db.locality.create({
      data: {
        name: input.name,
        slug: input.slug,
        cityId: input.cityId,
        pincode: input.pincode,
        latitude: input.latitude,
        longitude: input.longitude,
      },
      include: { city: true },
    });
    await AuditService.log(adminUserId, 'LOCALITY_CREATED', 'Locality', locality.id, { name: locality.name }, ipAddress);
    return locality;
  }

  public static async updateLocality(
    adminUserId: string,
    adminRole: Role,
    localityId: string,
    input: { name?: string; slug?: string; cityId?: string; pincode?: string },
    ipAddress?: string
  ) {
    AdminService.checkAdminAuthorization(adminRole);
    const updated = await db.locality.update({
      where: { id: localityId },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.slug && { slug: input.slug }),
        ...(input.cityId && { cityId: input.cityId }),
        ...(input.pincode !== undefined && { pincode: input.pincode }),
      },
      include: { city: true },
    });
    await AuditService.log(adminUserId, 'LOCALITY_UPDATED', 'Locality', localityId, { name: updated.name }, ipAddress);
    return updated;
  }

  // SubLocalities Management
  public static async getSubLocalities(userRole: Role, localityId?: string) {
    AdminService.checkAdminAuthorization(userRole);
    const where: Prisma.SubLocalityWhereInput = {};
    if (localityId) where.localityId = localityId;

    return db.subLocality.findMany({
      where,
      include: {
        locality: { include: { city: true } },
        _count: { select: { properties: true } },
      },
      take: 200,
      orderBy: { name: 'asc' },
    });
  }

  public static async createSubLocality(
    adminUserId: string,
    adminRole: Role,
    input: { name: string; slug: string; localityId: string; latitude?: number; longitude?: number },
    ipAddress?: string
  ) {
    AdminService.checkAdminAuthorization(adminRole);
    const subLocality = await db.subLocality.create({
      data: {
        name: input.name,
        slug: input.slug,
        localityId: input.localityId,
        latitude: input.latitude || 19.076,
        longitude: input.longitude || 72.8777,
      },
      include: { locality: true },
    });
    await AuditService.log(adminUserId, 'SUBLOCALITY_CREATED', 'SubLocality', subLocality.id, { name: subLocality.name }, ipAddress);
    return subLocality;
  }

  public static async updateSubLocality(
    adminUserId: string,
    adminRole: Role,
    subLocalityId: string,
    input: { name?: string; slug?: string },
    ipAddress?: string
  ) {
    AdminService.checkAdminAuthorization(adminRole);
    const updated = await db.subLocality.update({
      where: { id: subLocalityId },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.slug && { slug: input.slug }),
      },
      include: { locality: true },
    });
    await AuditService.log(adminUserId, 'SUBLOCALITY_UPDATED', 'SubLocality', subLocalityId, { name: updated.name }, ipAddress);
    return updated;
  }

  public static async getPropertyTypes(userRole: Role) {
    AdminService.checkAdminAuthorization(userRole);
    return db.propertyType.findMany({
      include: { _count: { select: { properties: true } } },
    });
  }

  public static async createPropertyType(adminUserId: string, adminRole: Role, input: CreatePropertyTypeInput, ipAddress?: string) {
    AdminService.checkAdminAuthorization(adminRole);
    const pt = await db.propertyType.create({
      data: {
        name: input.name,
        slug: input.slug,
        category: input.category as unknown as import('@prisma/client').PropertyCategory,
        icon: input.icon,
      },
    });
    await AuditService.log(adminUserId, 'PROPERTY_TYPE_CREATED', 'PropertyType', pt.id, { name: pt.name }, ipAddress);
    return pt;
  }

  public static async getAmenities(userRole: Role) {
    AdminService.checkAdminAuthorization(userRole);
    return db.amenity.findMany({
      include: { _count: { select: { properties: true } } },
    });
  }

  public static async createAmenity(adminUserId: string, adminRole: Role, input: CreateAmenityInput, ipAddress?: string) {
    AdminService.checkAdminAuthorization(adminRole);
    const amenity = await db.amenity.create({
      data: {
        name: input.name,
        slug: input.slug,
        category: input.category,
        icon: input.icon,
      },
    });
    await AuditService.log(adminUserId, 'AMENITY_CREATED', 'Amenity', amenity.id, { name: amenity.name }, ipAddress);
    return amenity;
  }

  public static async getLeads(userRole: Role, page = 1, limit = 20) {
    AdminService.checkAdminAuthorization(userRole);
    const skip = (page - 1) * limit;

    const [items, total] = await db.$transaction([
      db.lead.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          enquiry: true,
          property: { select: { id: true, title: true, slug: true } },
          seller: { select: { id: true, firstName: true, lastName: true, email: true } },
          assignedAgent: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      }),
      db.lead.count(),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    return { items, pagination: { page, limit, total, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 } };
  }

  public static async getEnquiries(userRole: Role, page = 1, limit = 20) {
    AdminService.checkAdminAuthorization(userRole);
    const skip = (page - 1) * limit;

    const [items, total] = await db.$transaction([
      db.enquiry.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
          property: { select: { id: true, title: true, slug: true } },
        },
      }),
      db.enquiry.count(),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    return { items, pagination: { page, limit, total, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 } };
  }

  public static async getVisits(userRole: Role, page = 1, limit = 20) {
    AdminService.checkAdminAuthorization(userRole);
    const skip = (page - 1) * limit;

    const [items, total] = await db.$transaction([
      db.propertyVisit.findMany({
        skip,
        take: limit,
        orderBy: { scheduledDate: 'desc' },
        include: {
          requester: { select: { id: true, firstName: true, lastName: true, email: true } },
          property: { select: { id: true, title: true, slug: true } },
        },
      }),
      db.propertyVisit.count(),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    return { items, pagination: { page, limit, total, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 } };
  }

  public static async getReports(userRole: Role, page = 1, limit = 20, statusFilter?: string) {
    AdminService.checkAdminAuthorization(userRole);
    const skip = (page - 1) * limit;

    const where: Prisma.ReportWhereInput = {};
    if (statusFilter) where.status = statusFilter;

    const [reports, total] = await db.$transaction([
      db.report.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          reporter: { select: { id: true, firstName: true, lastName: true, email: true } },
          property: { select: { id: true, title: true, slug: true } },
        },
      }),
      db.report.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items: reports,
      pagination: { page, limit, total, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 },
    };
  }

  public static async updateReportStatus(
    adminUserId: string,
    adminRole: Role,
    reportId: string,
    status: string,
    resolution?: string,
    ipAddress?: string
  ) {
    AdminService.checkAdminAuthorization(adminRole);

    const report = await db.report.findUnique({ where: { id: reportId } });
    if (!report) {
      throw new AppError(404, 'Report record not found', 'NOT_FOUND');
    }

    const updated = await db.report.update({
      where: { id: reportId },
      data: {
        status,
        resolution,
        moderatorId: adminUserId,
        resolvedAt: new Date(),
      },
    });

    await AuditService.log(adminUserId, 'REPORT_RESOLVED', 'Report', reportId, { status, resolution }, ipAddress);
    return updated;
  }

  public static async getAuditLogs(userRole: Role, page = 1, limit = 20) {
    AdminService.checkAdminAuthorization(userRole);
    const skip = (page - 1) * limit;

    const [logs, total] = await db.$transaction([
      db.auditLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, firstName: true, lastName: true, email: true, role: true } } },
      }),
      db.auditLog.count(),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items: logs,
      pagination: { page, limit, total, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 },
    };
  }

  public static async getFeatureFlags(userRole: Role) {
    AdminService.checkAdminAuthorization(userRole);
    return db.featureFlag.findMany({ orderBy: { key: 'asc' } });
  }

  public static async toggleFeatureFlag(adminUserId: string, adminRole: Role, flagId: string, isEnabled: boolean, ipAddress?: string) {
    AdminService.checkSuperAdminAuthorization(adminRole);

    const updated = await db.featureFlag.update({
      where: { id: flagId },
      data: { isEnabled },
    });

    await AuditService.log(adminUserId, 'FEATURE_FLAG_TOGGLED', 'FeatureFlag', flagId, { key: updated.key, isEnabled }, ipAddress);
    return updated;
  }

  public static async getSystemSettings(userRole: Role) {
    AdminService.checkAdminAuthorization(userRole);
    return db.systemSetting.findMany({ orderBy: { key: 'asc' } });
  }

  public static async updateSystemSetting(adminUserId: string, adminRole: Role, key: string, value: string, ipAddress?: string) {
    AdminService.checkAdminAuthorization(adminRole);

    const updated = await db.systemSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    await AuditService.log(adminUserId, 'SYSTEM_SETTING_UPDATED', 'SystemSetting', updated.id, { key, value }, ipAddress);
    return updated;
  }

  public static async getCMSContents(userRole: Role) {
    AdminService.checkAdminAuthorization(userRole);
    return db.cMSContent.findMany({ orderBy: { title: 'asc' } });
  }

  public static async upsertCMSContent(adminUserId: string, adminRole: Role, input: UpsertCMSContentInput, ipAddress?: string) {
    AdminService.checkAdminAuthorization(adminRole);

    const cms = await db.cMSContent.upsert({
      where: { slug: input.slug },
      update: {
        title: input.title,
        content: input.content,
        metaTitle: input.metaTitle,
        metaDesc: input.metaDesc,
      },
      create: {
        slug: input.slug,
        title: input.title,
        content: input.content,
        metaTitle: input.metaTitle,
        metaDesc: input.metaDesc,
      },
    });

    await AuditService.log(adminUserId, 'CMS_CONTENT_UPSERTED', 'CMSContent', cms.id, { slug: cms.slug }, ipAddress);
    return cms;
  }

  public static async getSystemHealth(userRole: Role) {
    AdminService.checkAdminAuthorization(userRole);

    let dbHealth = 'healthy';
    try {
      await db.$queryRaw`SELECT 1`;
    } catch {
      dbHealth = 'unhealthy';
    }

    return {
      status: dbHealth === 'healthy' ? 'healthy' : 'degraded',
      database: dbHealth,
      nodeVersion: process.version,
      uptimeSeconds: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    };
  }
}
