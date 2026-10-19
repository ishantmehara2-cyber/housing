import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { db } from '../src/config/db';
import { JwtService } from '../src/services/jwt.service';
import { SessionService } from '../src/services/session.service';
import { Role } from '@housing-clone/shared';

describe('Phase 10 Saved Searches API Engine', () => {
  let buyerToken: string;
  let createdSavedSearchId: string;

  beforeAll(async () => {
    const buyer = await db.user.findFirst({ where: { email: 'buyer@example.test' } });
    if (buyer) {
      const session = await SessionService.createSession(buyer.id, 'dummy_buyer_session_saved_search');
      buyerToken = JwtService.generateAccessToken(buyer.id, buyer.role as unknown as Role, session.id);
    }
  });

  it('1. should reject unauthenticated create saved search request', async () => {
    const res = await request(app)
      .post('/api/v1/saved-searches')
      .send({
        searchCriteria: { listingPurpose: 'BUY', city: 'mumbai' },
      });

    expect(res.status).toBe(401);
  });

  it('2. should create a new saved search for authenticated user', async () => {
    const res = await request(app)
      .post('/api/v1/saved-searches')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        name: '2 BHK Mumbai under 1.5 Cr',
        searchCriteria: {
          listingPurpose: 'BUY',
          city: 'mumbai',
          bhk: 2,
          maxPrice: 15000000,
        },
        enableAlerts: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.name).toBe('2 BHK Mumbai under 1.5 Cr');

    createdSavedSearchId = res.body.data.id;
  });

  it('3. should retrieve user saved searches list', async () => {
    const res = await request(app)
      .get('/api/v1/saved-searches')
      .set('Authorization', `Bearer ${buyerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.some((s: { id: string }) => s.id === createdSavedSearchId)).toBe(true);
  });

  it('4. should update saved search details', async () => {
    const res = await request(app)
      .patch(`/api/v1/saved-searches/${createdSavedSearchId}`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        name: 'Updated Search Name',
        enableAlerts: false,
      });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated Search Name');
    expect(res.body.data.enableAlerts).toBe(false);
  });

  it('5. should delete a saved search', async () => {
    const res = await request(app)
      .delete(`/api/v1/saved-searches/${createdSavedSearchId}`)
      .set('Authorization', `Bearer ${buyerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
