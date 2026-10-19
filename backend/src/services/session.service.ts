import { UserSession } from '@prisma/client';
import { db } from '../config/db';

const REFRESH_TOKEN_EXPIRY_DAYS = 7;

export class SessionService {
  public static async createSession(
    userId: string,
    tokenHash: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<UserSession> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

    return db.userSession.create({
      data: {
        userId,
        tokenHash,
        ipAddress,
        userAgent,
        expiresAt,
      },
    });
  }

  public static async findSessionByHash(userId: string, tokenHash: string): Promise<UserSession | null> {
    const session = await db.userSession.findFirst({
      where: {
        userId,
        tokenHash,
      },
    });

    if (!session) return null;

    if (new Date() > session.expiresAt) {
      // Clean up expired session
      await db.userSession.delete({ where: { id: session.id } }).catch(() => {});
      return null;
    }

    return session;
  }

  public static async updateSessionHash(
    sessionId: string,
    newTokenHash: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<UserSession> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

    return db.userSession.update({
      where: { id: sessionId },
      data: {
        tokenHash: newTokenHash,
        ipAddress,
        userAgent,
        expiresAt,
      },
    });
  }

  public static async revokeSession(sessionId: string): Promise<void> {
    await db.userSession.delete({ where: { id: sessionId } }).catch(() => {});
  }

  public static async revokeAllUserSessions(userId: string): Promise<void> {
    await db.userSession.deleteMany({ where: { userId } });
  }
}
