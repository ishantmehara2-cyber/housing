import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { db } from '../src/config/db';
import { JwtService } from '../src/services/jwt.service';
import { SessionService } from '../src/services/session.service';
import { Role } from '@housing-clone/shared';

describe('Phase 10 Recently Viewed Browsing History Engine', () => {
  let buyerToken: string;
  let testPropertyId: string;

  beforeAll(async () => {
    const buyer = await db.user.findFirst({ where: { email: 'buyer@example.test' } });
    if (buyer) {
      const session = await SessionService.createSession(buyer.id, 'dummy_buyer_session_recent');
      buyerToken = JwtService.generateAccessToken(buyer.id, buyer.role as unknown as Role, session.id);
    }

    const property = await db.property.findFirst({ where: { listingState: 'ACTIVE' } });
    if (property) {
      testPropertyId = property.id;
    }
  });

  it('1. should record viewed property in browsing history for authenticated user', async () => {
    const res = await request(app)
      .post(`/api/v1/recently-viewed/${testPropertyId}`)
      .set('Authorization', `Bearer ${buyerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('2. should retrieve user browsing history', async () => {
    const res = await request(app)
      .get('/api/v1/recently-viewed')
      .set('Authorization', `Bearer ${buyerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.some((p: { id: string }) => p.id === testPropertyId)).toBe(true);
  });

  it('3. should clear user browsing history', async () => {
    const res = await request(app)
      .delete('/api/v1/recently-viewed')
      .set('Authorization', `Bearer ${buyerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('cleared');
  });
});
