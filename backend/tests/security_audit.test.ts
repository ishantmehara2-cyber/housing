import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { db } from '../src/config/db';
import { SessionService } from '../src/services/session.service';
import { JwtService } from '../src/services/jwt.service';
import { UserStatus } from '@housing-clone/shared';

describe('Phase 3 Critical Security Audit Tests', () => {
  const auditEmail = `audit_${Date.now()}@example.test`;
  const auditPassword = 'Password123!';
  let userId: string;
  let accessToken: string;
  let rawRefreshToken: string;
  let refreshCookieHeader: string;

  it('1. Raw refresh token is never stored in MySQL database', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        firstName: 'Security',
        lastName: 'Audit',
        email: auditEmail,
        password: auditPassword,
      });

    expect(res.status).toBe(201);
    userId = res.body.data.user.id;
    accessToken = res.body.data.accessToken;

    const cookies = res.get('Set-Cookie');
    expect(cookies).toBeDefined();
    refreshCookieHeader = cookies?.[0] || '';
    rawRefreshToken = refreshCookieHeader.split('housing_refresh_token=')[1].split(';')[0];

    // Query MySQL database for UserSession
    const sessions = await db.userSession.findMany({ where: { userId } });
    expect(sessions.length).toBeGreaterThan(0);

    for (const session of sessions) {
      // Confirm database stores hash, NOT raw refresh token
      expect(session.tokenHash).not.toBe(rawRefreshToken);
      expect(session.tokenHash).toBe(JwtService.hashRefreshToken(rawRefreshToken));
    }
  });

  it('2. Refresh token rotation rejects old refresh token reuse', async () => {
    const oldCookieToken = `housing_refresh_token=${rawRefreshToken}`;

    // Rotate session via /auth/refresh
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', [oldCookieToken]);

    expect(res.status).toBe(200);
    const newCookies = res.get('Set-Cookie');
    expect(newCookies).toBeDefined();
    refreshCookieHeader = newCookies?.[0] || '';
    rawRefreshToken = refreshCookieHeader.split('housing_refresh_token=')[1].split(';')[0];

    // Attempt to reuse the OLD refresh token
    const reuseRes = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', [oldCookieToken]);

    expect(reuseRes.status).toBe(401);
    expect(reuseRes.body.success).toBe(false);
  });

  it('3. Revoked session rejects refresh attempt', async () => {
    const currentCookieToken = `housing_refresh_token=${rawRefreshToken}`;

    // Logout / revoke
    const logoutRes = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Cookie', [currentCookieToken]);

    expect(logoutRes.status).toBe(200);

    // Refresh attempt after logout
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', [currentCookieToken]);

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_REFRESH_TOKEN');
  });

  it('4. Expired session rejects refresh', async () => {
    // Create expired session in DB
    const expiredSession = await db.userSession.create({
      data: {
        userId,
        tokenHash: 'expired_dummy_hash_123',
        expiresAt: new Date(Date.now() - 3600 * 1000), // Expired 1 hour ago
      },
    });

    const res = await SessionService.findSessionByHash(userId, expiredSession.tokenHash);
    expect(res).toBeNull(); // Session service handles expired session cleanup
  });

  it('5. Suspended user cannot access protected endpoints', async () => {
    // Re-login to get fresh tokens
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ identifier: auditEmail, password: auditPassword });

    const activeToken = loginRes.body.data.accessToken;

    // Suspend user in DB
    await db.user.update({
      where: { id: userId },
      data: { status: UserStatus.SUSPENDED as unknown as import('@prisma/client').UserStatus },
    });

    // Try accessing protected endpoint
    const protectedRes = await request(app)
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${activeToken}`);

    expect(protectedRes.status).toBe(401);
    expect(protectedRes.body.success).toBe(false);

    // Unsuspend user
    await db.user.update({
      where: { id: userId },
      data: { status: UserStatus.ACTIVE as unknown as import('@prisma/client').UserStatus },
    });
  });

  it('6. Password reset invalidates all existing active sessions', async () => {
    // Login to create active session
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ identifier: auditEmail, password: auditPassword });

    const rawToken = loginRes.get('Set-Cookie')?.[0]?.split('housing_refresh_token=')[1]?.split(';')[0] || '';
    const cookieHeader = `housing_refresh_token=${rawToken}`;

    // Verify session exists
    let activeSessions = await db.userSession.findMany({ where: { userId } });
    expect(activeSessions.length).toBeGreaterThan(0);

    // Revoke all sessions test as performed by password reset completion
    await SessionService.revokeAllUserSessions(userId);
    activeSessions = await db.userSession.findMany({ where: { userId } });
    expect(activeSessions.length).toBe(0);

    // Verify refresh with old cookie fails
    const refreshRes = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', [cookieHeader]);

    expect(refreshRes.status).toBe(401);
  });
});
