import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { db } from '../src/config/db';
import { JwtService } from '../src/services/jwt.service';
import { SessionService } from '../src/services/session.service';
import { Role } from '@housing-clone/shared';

describe('Phase 18 Production Security Hardening & IDOR Protection', () => {
  let buyerToken: string;
  let testLeadId: string;

  beforeAll(async () => {
    const buyer = await db.user.findFirst({ where: { email: 'buyer@example.test' } });
    if (buyer) {
      const session = await SessionService.createSession(buyer.id, 'dummy_buyer_session_sec');
      buyerToken = JwtService.generateAccessToken(buyer.id, buyer.role as unknown as Role, session.id);
    }

    const owner = await db.user.findFirst({ where: { email: 'owner@example.test' } });
    if (owner) {
      const lead = await db.lead.findFirst({ where: { sellerId: owner.id } });
      if (lead) testLeadId = lead.id;
    }
  });

  it('1. should prevent unauthorized user from viewing or modifying another seller lead (IDOR Protection)', async () => {
    if (testLeadId) {
      const res = await request(app)
        .patch(`/api/v1/leads/${testLeadId}/status`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ status: 'CONVERTED' });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    }
  });

  it('2. unhandled 404 response should be sanitized without stack traces', async () => {
    const res = await request(app).get('/api/v1/non-existent-endpoint');

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
    expect(res.body).not.toHaveProperty('stack');
  });

  it('3. GET /api/v1/health/ready should verify database readiness probe', async () => {
    const res = await request(app).get('/api/v1/health/ready');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ready');
  });
});
