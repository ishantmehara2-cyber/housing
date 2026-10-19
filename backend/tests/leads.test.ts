import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { db } from '../src/config/db';
import { JwtService } from '../src/services/jwt.service';
import { SessionService } from '../src/services/session.service';
import { Role } from '@housing-clone/shared';

describe('Phase 11 Lead Management CRM Engine', () => {
  let buyerToken: string;
  let ownerToken: string;
  let testLeadId: string;

  beforeAll(async () => {
    const buyer = await db.user.findFirst({ where: { email: 'buyer@example.test' } });
    if (buyer) {
      const session = await SessionService.createSession(buyer.id, 'dummy_buyer_session_lead');
      buyerToken = JwtService.generateAccessToken(buyer.id, buyer.role as unknown as Role, session.id);
    }

    const owner = await db.user.findFirst({ where: { email: 'owner@example.test' } });
    if (owner) {
      const session = await SessionService.createSession(owner.id, 'dummy_owner_session_lead');
      ownerToken = JwtService.generateAccessToken(owner.id, owner.role as unknown as Role, session.id);

      // Find lead belonging to owner
      const lead = await db.lead.findFirst({ where: { sellerId: owner.id } });
      if (lead) {
        testLeadId = lead.id;
      }
    }
  });

  it('1. should retrieve seller leads for authenticated owner account', async () => {
    const res = await request(app)
      .get('/api/v1/leads')
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.items)).toBe(true);
  });

  it('2. should update lead status (NEW -> CONTACTED)', async () => {
    if (testLeadId) {
      const res = await request(app)
        .patch(`/api/v1/leads/${testLeadId}/status`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          status: 'CONTACTED',
          notes: 'Spoke with buyer on phone.',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('CONTACTED');
    }
  });

  it('3. should reject buyer trying to modify lead status', async () => {
    if (testLeadId) {
      const res = await request(app)
        .patch(`/api/v1/leads/${testLeadId}/status`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          status: 'CONVERTED',
        });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    }
  });
});
