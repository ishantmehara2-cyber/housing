import { db } from '../config/db';
import { AppError } from '../middlewares/errorHandler';
import { Role, ListingState, SearchPaginationMetadata } from '@housing-clone/shared';
import { AuditService } from './audit.service';
import { Prisma } from '@prisma/client';

export class DashboardService {
  private static checkDashboardAuthorization(userRole: Role): void {
    if (userRole === Role.TENANT_BUYER || userRole === Role.VISITOR) {
      throw new AppError(403, 'Tenant/Buyer accounts do not have access to seller dashboards', 'FORBIDDEN');
    }
  }

  public static async getOverviewMetrics(userId: string, userRole: Role) {
    DashboardService.checkDashboardAuthorization(userRole);

    const propertyWhere: Prisma.PropertyWhereInput = {};
    const leadWhere: Prisma.LeadWhereInput = {};
    const visitWhere: Prisma.PropertyVisitWhereInput = {};

    if (userRole !== Role.ADMIN && userRole !== Role.SUPER_ADMIN && userRole !== Role.MODERATOR) {
      propertyWhere.OR = [{ ownerId: userId }, { postedByUserId: userId }, { assignedAgentId: userId }];
      leadWhere.OR = [{ sellerId: userId }, { assignedAgentId: userId }];
      visitWhere.OR = [{ requesterId: userId }, { assignedUserId: userId }];
    }

    const [
      totalProps,
      activeProps,
      pendingProps,
      pausedProps,
      rejectedProps,
      totalLeads,
      newLeads,
      contactedLeads,
      convertedLeads,
      totalVisits,
      upcomingVisits,
      completedVisits,
      unreadNotifs,
      recentLeads,
      recentVisits,
    ] = await Promise.all([
      db.property.count({ where: propertyWhere }),
      db.property.count({ where: { ...propertyWhere, listingState: 'ACTIVE' } }),
      db.property.count({ where: { ...propertyWhere, listingState: 'PENDING_APPROVAL' } }),
      db.property.count({ where: { ...propertyWhere, listingState: 'PAUSED' } }),
      db.property.count({ where: { ...propertyWhere, listingState: 'REJECTED' } }),
      db.lead.count({ where: leadWhere }),
      db.lead.count({ where: { ...leadWhere, status: 'NEW' } }),
      db.lead.count({ where: { ...leadWhere, status: 'CONTACTED' } }),
      db.lead.count({ where: { ...leadWhere, status: 'CONVERTED' } }),
      db.propertyVisit.count({ where: visitWhere }),
      db.propertyVisit.count({ where: { ...visitWhere, status: 'SCHEDULED', scheduledDate: { gte: new Date() } } }),
      db.propertyVisit.count({ where: { ...visitWhere, status: 'COMPLETED' } }),
      db.notification.count({ where: { userId, isRead: false } }),
      db.lead.findMany({
        where: leadWhere,
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { enquiry: true, property: { select: { title: true, slug: true } } },
      }),
      db.propertyVisit.findMany({
        where: visitWhere,
        take: 5,
        orderBy: { scheduledDate: 'desc' },
        include: { property: { select: { title: true, slug: true } }, requester: { select: { firstName: true, lastName: true } } },
      }),
    ]);

    return {
      propertyCounts: {
        total: totalProps,
        active: activeProps,
        pending: pendingProps,
        paused: pausedProps,
        rejected: rejectedProps,
      },
      leadCounts: {
        total: totalLeads,
        newLeads,
        contacted: contactedLeads,
        converted: convertedLeads,
      },
      visitCounts: {
        total: totalVisits,
        upcoming: upcomingVisits,
        completed: completedVisits,
      },
      unreadNotifications: unreadNotifs,
      recentActivity: {
        leads: recentLeads,
        visits: recentVisits,
      },
    };
  }

  public static async getManagedProperties(
    userId: string,
    userRole: Role,
    page = 1,
    limit = 20,
    statusFilter?: string
  ): Promise<{ items: unknown[]; pagination: SearchPaginationMetadata }> {
    DashboardService.checkDashboardAuthorization(userRole);
    const skip = (page - 1) * limit;

    const where: Prisma.PropertyWhereInput = {};

    if (userRole !== Role.ADMIN && userRole !== Role.SUPER_ADMIN && userRole !== Role.MODERATOR) {
      where.OR = [{ ownerId: userId }, { postedByUserId: userId }, { assignedAgentId: userId }];
    }

    if (statusFilter) {
      where.listingState = statusFilter as unknown as import('@prisma/client').ListingState;
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
          media: { where: { mediaType: 'IMAGE' }, take: 1, orderBy: { displayOrder: 'asc' } },
        },
      }),
      db.property.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

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

  public static async updatePropertyListingStatus(
    userId: string,
    userRole: Role,
    propertyId: string,
    status: ListingState,
    ipAddress?: string
  ) {
    DashboardService.checkDashboardAuthorization(userRole);

    const property = await db.property.findUnique({ where: { id: propertyId } });
    if (!property) {
      throw new AppError(404, 'Property listing not found', 'NOT_FOUND');
    }

    if (
      userRole !== Role.ADMIN &&
      userRole !== Role.SUPER_ADMIN &&
      property.ownerId !== userId &&
      property.postedByUserId !== userId &&
      property.assignedAgentId !== userId
    ) {
      throw new AppError(403, 'You are not authorized to manage this property status', 'FORBIDDEN');
    }

    // Enforce transition validation rules
    if (status === 'ACTIVE' && property.listingState !== 'PAUSED' && userRole !== Role.ADMIN && userRole !== Role.SUPER_ADMIN) {
      throw new AppError(403, 'Normal users cannot directly publish listings to ACTIVE status without admin moderation approval', 'FORBIDDEN');
    }

    const updated = await db.property.update({
      where: { id: propertyId },
      data: { listingState: status as unknown as import('@prisma/client').ListingState },
    });

    await AuditService.log(
      userId,
      'PROPERTY_STATUS_CHANGED',
      'Property',
      propertyId,
      { newStatus: status },
      ipAddress
    );

    return updated;
  }
}
