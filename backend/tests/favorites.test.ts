import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { db } from '../src/config/db';
import { JwtService } from '../src/services/jwt.service';
import { SessionService } from '../src/services/session.service';
import { Role } from '@housing-clone/shared';

describe('Phase 8 - Favorites API & Persistence Engine', () => {
  let buyerToken: string;
  let testPropertyId: string;

  beforeAll(async () => {
    // Fetch seeded buyer user
    const buyer = await db.user.findFirst({ where: { email: 'buyer@example.test' } });
    if (buyer) {
      const session = await SessionService.createSession(buyer.id, 'dummy_buyer_session_fav');
      buyerToken = JwtService.generateAccessToken(buyer.id, buyer.role as unknown as Role, session.id);
    }

    // Fetch an active property
    const property = await db.property.findFirst({ where: { listingState: 'ACTIVE' } });
    if (property) {
      testPropertyId = property.id;
    }
  });

  it('1. should reject unauthenticated request to add favorite', async () => {
    const res = await request(app).post(`/api/v1/favorites/${testPropertyId}`);
    expect(res.status).toBe(401);
  });

  it('2. should save property to user favorites in MySQL database', async () => {
    const res = await request(app)
      .post(`/api/v1/favorites/${testPropertyId}`)
      .set('Authorization', `Bearer ${buyerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('saved to favorites');
  });

  it('3. should retrieve saved favorites list with pagination metadata', async () => {
    const res = await request(app)
      .get('/api/v1/favorites')
      .set('Authorization', `Bearer ${buyerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.items)).toBe(true);
    expect(res.body.data.items.some((p: { id: string }) => p.id === testPropertyId)).toBe(true);
  });

  it('4. should remove property from user favorites', async () => {
    const res = await request(app)
      .delete(`/api/v1/favorites/${testPropertyId}`)
      .set('Authorization', `Bearer ${buyerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('removed from favorites');
  });
});
