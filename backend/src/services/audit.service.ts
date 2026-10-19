import { Prisma } from '@prisma/client';
import { db } from '../config/db';
import { logger } from '../utils/logger';

export class AuditService {
  public static async log(
    userId: string | null,
    action: string,
    entity: string,
    entityId?: string,
    details?: unknown,
    ipAddress?: string
  ): Promise<void> {
    try {
      await db.auditLog.create({
        data: {
          userId,
          action,
          entity,
          entityId,
          details: details ? (JSON.parse(JSON.stringify(details)) as Prisma.InputJsonValue) : Prisma.JsonNull,
          ipAddress,
        },
      });
    } catch (err) {
      logger.error({ err, action, entity }, 'Failed to record audit log');
    }
  }
}
