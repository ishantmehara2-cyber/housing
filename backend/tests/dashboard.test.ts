import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { db } from '../src/config/db';
import { JwtService } from '../src/services/jwt.service';
import { SessionService } from '../src/services/session.service';
import { Role } from '@housing-clone/shared';

describe('Phase 12 Owner, Agent & Developer Dashboards Engine', () => {
  let buyerToken: string;
  let ownerToken: string;
  let testPropertyId: string;

  beforeAll(async () => {
    const buyer = await db.user.findFirst({ where: { email: 'buyer@example.test' } });
    if (buyer) {
      const session = await SessionService.createSession(buyer.id, 'dummy_buyer_session_dash');
      buyerToken = JwtService.generateAccessToken(buyer.id, buyer.role as unknown as Role, session.id);
    }

    const owner = await db.user.findFirst({ where: { email: 'owner@example.test' } });
    if (owner) {
      const session = await SessionService.createSession(owner.id, 'dummy_owner_session_dash');
      ownerToken = JwtService.generateAccessToken(owner.id, owner.role as unknown as Role, session.id);

      const prop = await db.property.findFirst({ where: { ownerId: owner.id } });
      if (prop) testPropertyId = prop.id;
    }
  });

  it('1. should reject TENANT_BUYER accessing seller dashboard overview with 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/overview')
      .set('Authorization', `Bearer ${buyerToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('2. should return overview metrics for authenticated OWNER user', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/overview')
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('propertyCounts');
    expect(res.body.data).toHaveProperty('leadCounts');
    expect(res.body.data).toHaveProperty('visitCounts');
  });

  it('3. should retrieve paginated managed properties for owner account', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/properties')
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.items)).toBe(true);
  });

  it('4. should update property listing status (ACTIVE -> PAUSED)', async () => {
    if (testPropertyId) {
      const res = await request(app)
        .patch(`/api/v1/dashboard/properties/${testPropertyId}/status`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ status: 'PAUSED' });

      expect(res.status).toBe(200);
      expect(res.body.data.listingState).toBe('PAUSED');

      // Revert status
      await db.property.update({
        where: { id: testPropertyId },
        data: { listingState: 'ACTIVE' },
      });
    }
  });
});
