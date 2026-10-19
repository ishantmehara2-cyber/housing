import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';

describe('Phase 15 Geocoding API Engine', () => {
  it('1. GET /api/v1/geocoding/search should return forward geocoding results', async () => {
    const res = await request(app).get('/api/v1/geocoding/search?q=Powai');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0]).toHaveProperty('latitude');
    expect(res.body.data[0]).toHaveProperty('longitude');
  });

  it('2. GET /api/v1/geocoding/reverse should return reverse geocoding result', async () => {
    const res = await request(app).get('/api/v1/geocoding/reverse?lat=19.1176&lng=72.906');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('label');
    expect(res.body.data).toHaveProperty('city');
  });
});
