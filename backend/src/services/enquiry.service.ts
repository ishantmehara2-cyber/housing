import { db } from '../config/db';
import { AppError } from '../middlewares/errorHandler';
import { CreateEnquiryInput, NotificationChannel } from '@housing-clone/shared';
import { NotificationService } from './notification/notification.service';
import { AuditService } from './audit.service';

export class EnquiryService {
  public static async createEnquiry(userId: string, input: CreateEnquiryInput, ipAddress?: string) {
    const property = await db.property.findUnique({
      where: { id: input.propertyId },
      include: {
        owner: true,
        assignedAgent: true,
        developerOrganization: { include: { members: true } },
      },
    });

    if (!property || property.listingState === 'REJECTED' || property.listingState === 'DRAFT') {
      throw new AppError(404, 'Property listing not found or unavailable for enquiry', 'NOT_FOUND');
    }

    // Rate Limiting / Duplicate Enquiry Protection (1 hour window)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const existingEnquiry = await db.enquiry.findFirst({
      where: {
        userId,
        propertyId: input.propertyId,
        createdAt: { gte: oneHourAgo },
      },
    });

    if (existingEnquiry) {
      throw new AppError(
        400,
        'You have recently sent an enquiry for this property. Please wait before submitting another.',
        'DUPLICATE_ENQUIRY'
      );
    }

    // Determine lead seller/recipient
    const sellerId = property.ownerId;
    const assignedAgentId = property.assignedAgentId || undefined;

    // Execute Enquiry & Lead Creation in a single transaction
    const { enquiry } = await db.$transaction(async (tx) => {
      const enq = await tx.enquiry.create({
        data: {
          propertyId: input.propertyId,
          userId,
          name: input.name,
          email: input.email,
          phone: input.phone,
          message: input.message,
          source: input.source || 'WEB',
        },
      });

      // Upsert corresponding Lead record
      await tx.lead.upsert({
        where: { enquiryId: enq.id },
        create: {
          enquiryId: enq.id,
          propertyId: input.propertyId,
          sellerId,
          assignedAgentId,
          leadScore: 75,
          status: 'NEW',
          notes: `Initial enquiry message: ${input.message}`,
        },
        update: {},
      });

      // Increment property enquiryCount
      await tx.property.update({
        where: { id: input.propertyId },
        data: { enquiryCount: { increment: 1 } },
      });

      return { enquiry: enq };
    });

    // Send Notification to seller/owner
    await NotificationService.createNotification(
      sellerId,
      'New Property Enquiry Received',
      `${input.name} sent an enquiry for "${property.title}": "${input.message.substring(0, 80)}..."`,
      'ENQUIRY',
      NotificationChannel.IN_APP
    );

    // Audit Log
    await AuditService.log(userId, 'ENQUIRY_CREATED', 'Enquiry', enquiry.id, { propertyId: input.propertyId }, ipAddress);

    return {
      id: enquiry.id,
      propertyId: enquiry.propertyId,
      name: enquiry.name,
      email: enquiry.email,
      phone: enquiry.phone,
      message: enquiry.message,
      createdAt: enquiry.createdAt.toISOString(),
    };
  }
}
