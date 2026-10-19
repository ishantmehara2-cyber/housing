import { db } from '../config/db';
import { AppError } from '../middlewares/errorHandler';
import { Role, CreateVisitInput, UpdateVisitStatusInput, SearchPaginationMetadata, NotificationChannel } from '@housing-clone/shared';
import { NotificationService } from './notification/notification.service';
import { AuditService } from './audit.service';
import { Prisma } from '@prisma/client';

export class VisitService {
  public static async createVisit(userId: string, input: CreateVisitInput, ipAddress?: string) {
    const property = await db.property.findUnique({
      where: { id: input.propertyId },
    });

    if (!property || property.listingState === 'REJECTED' || property.listingState === 'DRAFT') {
      throw new AppError(404, 'Property listing not found or unavailable for visit', 'NOT_FOUND');
    }

    const scheduledDate = new Date(input.scheduledDate);
    if (isNaN(scheduledDate.getTime()) || scheduledDate < new Date()) {
      throw new AppError(400, 'Scheduled visit date must be a valid future date', 'INVALID_DATE');
    }

    // Check for duplicate pending visit request
    const existingVisit = await db.propertyVisit.findFirst({
      where: {
        propertyId: input.propertyId,
        requesterId: userId,
        status: 'SCHEDULED',
      },
    });

    if (existingVisit) {
      throw new AppError(400, 'You already have an active scheduled visit request for this property', 'DUPLICATE_VISIT');
    }

    const assignedUserId = property.assignedAgentId || property.ownerId;

    const visit = await db.propertyVisit.create({
      data: {
        propertyId: input.propertyId,
        requesterId: userId,
        assignedUserId,
        scheduledDate,
        timeSlot: input.timeSlot,
        notes: input.notes,
        status: 'SCHEDULED',
      },
    });

    // Notify assigned owner/agent
    await NotificationService.createNotification(
      assignedUserId,
      'New Property Visit Requested',
      `A new visit has been scheduled for "${property.title}" on ${scheduledDate.toLocaleDateString()} at ${input.timeSlot}.`,
      'VISIT',
      NotificationChannel.IN_APP
    );

    // Audit Log
    await AuditService.log(userId, 'VISIT_REQUESTED', 'PropertyVisit', visit.id, { propertyId: input.propertyId }, ipAddress);

    return visit;
  }

  public static async getUserVisits(
    userId: string,
    userRole: Role,
    page = 1,
    limit = 20
  ): Promise<{ items: unknown[]; pagination: SearchPaginationMetadata }> {
    const skip = (page - 1) * limit;

    const where: Prisma.PropertyVisitWhereInput = {};

    if (userRole !== Role.ADMIN && userRole !== Role.SUPER_ADMIN) {
      where.OR = [{ requesterId: userId }, { assignedUserId: userId }];
    }

    const [items, total] = await db.$transaction([
      db.propertyVisit.findMany({
        where,
        skip,
        take: limit,
        orderBy: { scheduledDate: 'desc' },
        include: {
          property: {
            select: { id: true, title: true, slug: true, address: true },
          },
          requester: { select: { id: true, firstName: true, lastName: true, phone: true } },
          assignedUser: { select: { id: true, firstName: true, lastName: true, phone: true } },
        },
      }),
      db.propertyVisit.count({ where }),
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

  public static async getVisitById(userId: string, userRole: Role, visitId: string) {
    const visit = await db.propertyVisit.findUnique({
      where: { id: visitId },
      include: {
        property: true,
        requester: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        assignedUser: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
      },
    });

    if (!visit) {
      throw new AppError(404, 'Property visit record not found', 'NOT_FOUND');
    }

    if (
      userRole !== Role.ADMIN &&
      userRole !== Role.SUPER_ADMIN &&
      visit.requesterId !== userId &&
      visit.assignedUserId !== userId
    ) {
      throw new AppError(403, 'You are not authorized to view this visit record', 'FORBIDDEN');
    }

    return visit;
  }

  public static async updateVisitStatus(
    userId: string,
    userRole: Role,
    visitId: string,
    input: UpdateVisitStatusInput,
    ipAddress?: string
  ) {
    const visit = await db.propertyVisit.findUnique({
      where: { id: visitId },
      include: { property: true },
    });

    if (!visit) {
      throw new AppError(404, 'Property visit record not found', 'NOT_FOUND');
    }

    if (
      userRole !== Role.ADMIN &&
      userRole !== Role.SUPER_ADMIN &&
      visit.requesterId !== userId &&
      visit.assignedUserId !== userId
    ) {
      throw new AppError(403, 'You are not authorized to modify this visit record', 'FORBIDDEN');
    }

    const updated = await db.propertyVisit.update({
      where: { id: visitId },
      data: {
        status: input.status as unknown as import('@prisma/client').VisitStatus,
        notes: input.notes ? `${visit.notes || ''}\n[Update]: ${input.notes}` : visit.notes,
        cancelledAt: input.status === 'CANCELLED' ? new Date() : visit.cancelledAt,
      },
    });

    // Notify requester
    await NotificationService.createNotification(
      visit.requesterId,
      'Property Visit Status Update',
      `Your visit for "${visit.property.title}" has been updated to ${input.status}.`,
      'VISIT_STATUS',
      NotificationChannel.IN_APP
    );

    // Audit Log
    await AuditService.log(userId, 'VISIT_STATUS_CHANGED', 'PropertyVisit', visitId, { newStatus: input.status }, ipAddress);

    return updated;
  }
}
