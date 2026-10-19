import { db } from '../config/db';
import { Prisma } from '@prisma/client';

export class AnalyticsService {
  public static async recordEvent(input: {
    eventName: string;
    userId?: string;
    sessionId?: string;
    propertyId?: string;
    metadata?: Prisma.InputJsonValue;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return db.analyticsEvent.create({
      data: {
        eventName: input.eventName,
        userId: input.userId,
        sessionId: input.sessionId,
        propertyId: input.propertyId,
        metadata: input.metadata,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      },
    });
  }

  public static async getAdminAnalyticsSummary() {
    const [totalEvents, propertyViews, searchesCount, enquiriesCount, visitsCount, topProperties] = await Promise.all([
      db.analyticsEvent.count(),
      db.analyticsEvent.count({ where: { eventName: 'property_view' } }),
      db.analyticsEvent.count({ where: { eventName: 'search_performed' } }),
      db.analyticsEvent.count({ where: { eventName: 'enquiry_created' } }),
      db.analyticsEvent.count({ where: { eventName: 'visit_scheduled' } }),
      db.property.findMany({
        take: 5,
        orderBy: { viewCount: 'desc' },
        select: { id: true, title: true, slug: true, viewCount: true, enquiryCount: true },
      }),
    ]);

    return {
      eventMetrics: {
        totalEvents,
        propertyViews,
        searchesCount,
        enquiriesCount,
        visitsCount,
      },
      topProperties,
    };
  }
}
