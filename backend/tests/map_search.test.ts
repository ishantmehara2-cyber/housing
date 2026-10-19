import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';

describe('Phase 15 Map Bounds & Spatial Search Engine', () => {
  it('1. GET /api/v1/search/properties with bounding box coordinates should filter properties', async () => {
    const res = await request(app).get('/api/v1/search/properties?minLat=18.0&maxLat=20.0&minLng=71.0&maxLng=74.0');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.items)).toBe(true);
  });
});
