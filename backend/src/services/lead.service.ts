import { db } from '../config/db';
import { AppError } from '../middlewares/errorHandler';
import { Role, UpdateLeadStatusInput, SearchPaginationMetadata, NotificationChannel } from '@housing-clone/shared';
import { NotificationService } from './notification/notification.service';
import { AuditService } from './audit.service';
import { Prisma } from '@prisma/client';

export class LeadService {
  public static async getUserLeads(
    userId: string,
    userRole: Role,
    page = 1,
    limit = 20,
    statusFilter?: string
  ): Promise<{ items: unknown[]; pagination: SearchPaginationMetadata }> {
    const skip = (page - 1) * limit;

    const where: Prisma.LeadWhereInput = {};

    if (userRole !== Role.ADMIN && userRole !== Role.SUPER_ADMIN && userRole !== Role.MODERATOR) {
      where.OR = [{ sellerId: userId }, { assignedAgentId: userId }];
    }

    if (statusFilter) {
      where.status = statusFilter as unknown as import('@prisma/client').LeadStatus;
    }

    const [items, total] = await db.$transaction([
      db.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          enquiry: true,
          property: {
            select: { id: true, title: true, slug: true, price: true, rent: true },
          },
        },
      }),
      db.lead.count({ where }),
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

  public static async getLeadById(userId: string, userRole: Role, leadId: string) {
    const lead = await db.lead.findUnique({
      where: { id: leadId },
      include: {
        enquiry: true,
        property: true,
        seller: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        assignedAgent: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
      },
    });

    if (!lead) {
      throw new AppError(404, 'Lead record not found', 'NOT_FOUND');
    }

    if (
      userRole !== Role.ADMIN &&
      userRole !== Role.SUPER_ADMIN &&
      userRole !== Role.MODERATOR &&
      lead.sellerId !== userId &&
      lead.assignedAgentId !== userId
    ) {
      throw new AppError(403, 'You are not authorized to view this lead', 'FORBIDDEN');
    }

    return lead;
  }

  public static async updateLeadStatus(
    userId: string,
    userRole: Role,
    leadId: string,
    input: UpdateLeadStatusInput,
    ipAddress?: string
  ) {
    const lead = await db.lead.findUnique({
      where: { id: leadId },
      include: { enquiry: true, property: true },
    });

    if (!lead) {
      throw new AppError(404, 'Lead record not found', 'NOT_FOUND');
    }

    if (
      userRole !== Role.ADMIN &&
      userRole !== Role.SUPER_ADMIN &&
      userRole !== Role.MODERATOR &&
      lead.sellerId !== userId &&
      lead.assignedAgentId !== userId
    ) {
      throw new AppError(403, 'You are not authorized to modify this lead', 'FORBIDDEN');
    }

    const isClosed = input.status === 'CONVERTED' || input.status === 'LOST';

    const updated = await db.lead.update({
      where: { id: leadId },
      data: {
        status: input.status as unknown as import('@prisma/client').LeadStatus,
        notes: input.notes ? `${lead.notes || ''}\n[Update]: ${input.notes}` : lead.notes,
        contactedAt: input.status === 'CONTACTED' ? new Date() : lead.contactedAt,
        closedAt: isClosed ? new Date() : lead.closedAt,
      },
    });

    // Notify interested buyer user
    await NotificationService.createNotification(
      lead.enquiry.userId,
      'Property Lead Status Update',
      `Your enquiry status for "${lead.property.title}" has been updated to ${input.status}.`,
      'LEAD_STATUS',
      NotificationChannel.IN_APP
    );

    // Audit Log
    await AuditService.log(
      userId,
      'LEAD_STATUS_CHANGED',
      'Lead',
      leadId,
      { newStatus: input.status },
      ipAddress
    );

    return updated;
  }
}
