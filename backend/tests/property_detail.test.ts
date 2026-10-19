import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { db } from '../src/config/db';

describe('Phase 9 Property Details API Engine', () => {
  it('1. GET /api/v1/properties/:slug should return full property details with relational models', async () => {
    const property = await db.property.findFirst({ where: { listingState: 'ACTIVE' } });
    expect(property).toBeDefined();

    if (property) {
      const res = await request(app).get(`/api/v1/properties/${property.slug}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('title');
      expect(res.body.data).toHaveProperty('carpetArea');
      expect(res.body.data).toHaveProperty('city');
      expect(res.body.data).toHaveProperty('locality');
      expect(res.body.data).toHaveProperty('postedByUser');
      expect(res.body.data.city).toHaveProperty('name');
    }
  });

  it('2. GET /api/v1/properties/invalid-non-existent-slug should return HTTP 404', async () => {
    const res = await request(app).get('/api/v1/properties/invalid-non-existent-slug-xyz');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('PROPERTY_NOT_FOUND');
  });

  it('3. Property detail response should never leak sensitive user or authentication fields', async () => {
    const property = await db.property.findFirst({ where: { listingState: 'ACTIVE' } });
    if (property) {
      const res = await request(app).get(`/api/v1/properties/${property.slug}`);

      expect(res.status).toBe(200);
      const data = res.body.data;

      expect(data.owner).not.toHaveProperty('passwordHash');
      expect(data.owner).not.toHaveProperty('refreshToken');
      expect(data.postedByUser).not.toHaveProperty('passwordHash');
    }
  });
});
