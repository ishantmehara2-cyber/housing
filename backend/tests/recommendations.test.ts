import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { db } from '../src/config/db';
import { JwtService } from '../src/services/jwt.service';
import { SessionService } from '../src/services/session.service';
import { Role } from '@housing-clone/shared';

describe('Phase 16 Smart Property Discovery & Recommendation Engine', () => {
  let buyerToken: string;
  let buyerUserId: string;
  let testPropertyId: string;

  beforeAll(async () => {
    const buyer = await db.user.findFirst({ where: { email: 'buyer@example.test' } });
    if (buyer) {
      buyerUserId = buyer.id;
      const session = await SessionService.createSession(buyer.id, 'dummy_buyer_session_rec');
      buyerToken = JwtService.generateAccessToken(buyer.id, buyer.role as unknown as Role, session.id);
    }

    const prop = await db.property.findFirst({ where: { listingState: 'ACTIVE' } });
    if (prop) testPropertyId = prop.id;
  });

  it('1. GET /api/v1/recommendations should return guest contextual recommendations feed', async () => {
    const res = await request(app).get('/api/v1/recommendations?limit=6');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.algorithmVersion).toBe('recommendation-v1');
    expect(Array.isArray(res.body.data.items)).toBe(true);
  });

  it('2. GET /api/v1/recommendations should return personalized feed with explanation reasons', async () => {
    const res = await request(app)
      .get('/api/v1/recommendations?limit=6')
      .set('Authorization', `Bearer ${buyerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items[0]).toHaveProperty('score');
    expect(res.body.data.items[0]).toHaveProperty('reasons');
    expect(Array.isArray(res.body.data.items[0].reasons)).toBe(true);
  });

  it('3. GET /api/v1/recommendations/properties/:id/similar should return similar properties', async () => {
    if (testPropertyId) {
      const res = await request(app).get(`/api/v1/recommendations/properties/${testPropertyId}/similar`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    }
  });

  it('4. should update user explicit property preferences', async () => {
    const res = await request(app)
      .patch('/api/v1/recommendations/preferences')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        preferredListingPurpose: 'BUY',
        preferredBhk: 3,
        minPrice: 5000000,
        maxPrice: 20000000,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.preferredBhk).toBe(3);
  });

  it('5. should record user recommendation feedback', async () => {
    if (testPropertyId) {
      const res = await request(app)
        .post('/api/v1/recommendations/feedback')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          propertyId: testPropertyId,
          feedback: 'NOT_INTERESTED',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Clean up feedback record
      await db.recommendationFeedback.deleteMany({ where: { userId: buyerUserId, propertyId: testPropertyId } });
    }
  });
});
