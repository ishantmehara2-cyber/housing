import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { db } from '../src/config/db';
import { JwtService } from '../src/services/jwt.service';
import { SessionService } from '../src/services/session.service';
import { Role } from '@housing-clone/shared';

describe('Phase 13 Admin Moderation Portal & System Audit Logging Engine', () => {
  let buyerToken: string;
  let ownerToken: string;
  let adminToken: string;
  let testPropertyId: string;
  let testBuyerUserId: string;

  beforeAll(async () => {
    const buyer = await db.user.findFirst({ where: { email: 'buyer@example.test' } });
    if (buyer) {
      testBuyerUserId = buyer.id;
      const session = await SessionService.createSession(buyer.id, 'dummy_buyer_session_adm');
      buyerToken = JwtService.generateAccessToken(buyer.id, buyer.role as unknown as Role, session.id);
    }

    const owner = await db.user.findFirst({ where: { email: 'owner@example.test' } });
    if (owner) {
      const session = await SessionService.createSession(owner.id, 'dummy_owner_session_adm');
      ownerToken = JwtService.generateAccessToken(owner.id, owner.role as unknown as Role, session.id);
    }

    const admin = await db.user.findFirst({ where: { email: 'admin@example.test' } });
    if (admin) {
      const session = await SessionService.createSession(admin.id, 'dummy_admin_session_adm');
      adminToken = JwtService.generateAccessToken(admin.id, admin.role as unknown as Role, session.id);
    }

    const prop = await db.property.findFirst();
    if (prop) testPropertyId = prop.id;
  });

  it('1. should reject TENANT_BUYER accessing admin overview with 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/v1/admin/overview')
      .set('Authorization', `Bearer ${buyerToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('2. should reject OWNER accessing admin moderation endpoints with 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/v1/admin/properties')
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('3. should return admin overview metrics for authenticated ADMIN user', async () => {
    const res = await request(app)
      .get('/api/v1/admin/overview')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('userCounts');
    expect(res.body.data).toHaveProperty('propertyCounts');
    expect(res.body.data).toHaveProperty('reportCounts');
  });

  it('4. should allow ADMIN to fetch property moderation queue', async () => {
    const res = await request(app)
      .get('/api/v1/admin/properties')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.items)).toBe(true);
  });

  it('5. should reject property rejection without mandatory rejection reason', async () => {
    if (testPropertyId) {
      const res = await request(app)
        .patch(`/api/v1/admin/properties/${testPropertyId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'REJECTED' });

      expect(res.status).toBe(400);
    }
  });

  it('6. should allow ADMIN to update property verification state to VERIFIED', async () => {
    if (testPropertyId) {
      const res = await request(app)
        .patch(`/api/v1/admin/verification/${testPropertyId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          verificationState: 'VERIFIED',
          notes: 'Verified by Admin Team in automated test',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.verificationState).toBe('VERIFIED');
    }
  });

  it('7. should allow ADMIN to suspend and reactivate a non-admin user account', async () => {
    if (testBuyerUserId) {
      // Suspend
      const resSuspend = await request(app)
        .patch(`/api/v1/admin/users/${testBuyerUserId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'SUSPENDED' });

      expect(resSuspend.status).toBe(200);
      expect(resSuspend.body.data.status).toBe('SUSPENDED');

      // Reactivate
      const resReactivate = await request(app)
        .patch(`/api/v1/admin/users/${testBuyerUserId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'ACTIVE' });

      expect(resReactivate.status).toBe(200);
      expect(resReactivate.body.data.status).toBe('ACTIVE');
    }
  });

  it('8. should allow ADMIN to retrieve system audit logs', async () => {
    const res = await request(app)
      .get('/api/v1/admin/audit-logs')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.items)).toBe(true);
  });
});
