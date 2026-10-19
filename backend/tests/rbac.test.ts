import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { requireAuth, requireRole } from '../src/middlewares/auth.middleware';
import { errorHandler } from '../src/middlewares/errorHandler';
import { JwtService } from '../src/services/jwt.service';
import { Role } from '@housing-clone/shared';
import { db } from '../src/config/db';
import { SessionService } from '../src/services/session.service';

const testApp = express();
testApp.use(express.json());

// Admin-only dummy route
testApp.get('/api/v1/test/admin-only', requireAuth, requireRole(Role.ADMIN, Role.SUPER_ADMIN), (_req, res) => {
  res.status(200).json({ success: true, message: 'Welcome Admin' });
});

testApp.use(errorHandler);

describe('RBAC Middleware Security', () => {
  let buyerToken: string;
  let adminToken: string;

  beforeAll(async () => {
    // Fetch seeded buyer user
    const buyer = await db.user.findFirst({ where: { email: 'buyer@example.test' } });
    if (buyer) {
      const session = await SessionService.createSession(buyer.id, 'dummy_buyer_session_hash');
      buyerToken = JwtService.generateAccessToken(buyer.id, buyer.role as unknown as Role, session.id);
    }

    // Fetch seeded admin user
    const admin = await db.user.findFirst({ where: { email: 'admin@example.test' } });
    if (admin) {
      const session = await SessionService.createSession(admin.id, 'dummy_admin_session_hash');
      adminToken = JwtService.generateAccessToken(admin.id, admin.role as unknown as Role, session.id);
    }
  });

  it('1. should reject TENANT_BUYER accessing ADMIN route with 403 Forbidden', async () => {
    const res = await request(testApp)
      .get('/api/v1/test/admin-only')
      .set('Authorization', `Bearer ${buyerToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('2. should allow ADMIN accessing ADMIN route with 200 OK', async () => {
    const res = await request(testApp)
      .get('/api/v1/test/admin-only')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Welcome Admin');
  });
});
