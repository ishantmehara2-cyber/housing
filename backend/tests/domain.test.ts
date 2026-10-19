import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';

describe('Phase 4 Core Domain APIs', () => {
  it('1. GET /api/v1/locations/states should return list of states', async () => {
    const res = await request(app).get('/api/v1/locations/states');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty('code');
    expect(res.body.data[0]).toHaveProperty('name');
  });

  it('2. GET /api/v1/locations/cities should return list of active cities', async () => {
    const res = await request(app).get('/api/v1/locations/cities');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty('slug');
    expect(res.body.data[0]).toHaveProperty('state');
  });

  it('3. GET /api/v1/locations/cities/:slug/localities should return city localities', async () => {
    const res = await request(app).get('/api/v1/locations/cities/mumbai/localities');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty('slug');
    expect(res.body.data[0]).toHaveProperty('cityId');
  });

  it('4. GET /api/v1/locations/cities/non-existent-city/localities should return 404', async () => {
    const res = await request(app).get('/api/v1/locations/cities/non-existent-city/localities');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('CITY_NOT_FOUND');
  });

  it('5. GET /api/v1/property-types should return property type catalog', async () => {
    const res = await request(app).get('/api/v1/property-types');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty('category');
  });

  it('6. GET /api/v1/amenities should return standardized amenities list', async () => {
    const res = await request(app).get('/api/v1/amenities');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty('category');
  });

  it('7. GET /api/v1/projects/:slug should return detailed project info', async () => {
    const res = await request(app).get('/api/v1/projects/apex-horizon-heights');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.slug).toBe('apex-horizon-heights');
    expect(res.body.data).toHaveProperty('developerOrganization');
    expect(res.body.data.developerOrganization.slug).toBe('apex-realty');
    expect(res.body.data).toHaveProperty('city');
    expect(res.body.data).toHaveProperty('locality');
    expect(res.body.data).toHaveProperty('amenities');
  });

  it('8. GET /api/v1/properties/:slug should return full property details without private leaks', async () => {
    const res = await request(app).get('/api/v1/properties/luxurious-3bhk-apartment-powai-mumbai');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.slug).toBe('luxurious-3bhk-apartment-powai-mumbai');
    expect(res.body.data.city.slug).toBe('mumbai');
    expect(res.body.data.propertyType.slug).toBe('apartment');
    expect(res.body.data.owner).toHaveProperty('id');
    expect(res.body.data.owner).not.toHaveProperty('passwordHash'); // Private field masked
    expect(Array.isArray(res.body.data.amenities)).toBe(true);
    expect(Array.isArray(res.body.data.media)).toBe(true);
  });

  it('9. GET /api/v1/properties/invalid-slug should return 404', async () => {
    const res = await request(app).get('/api/v1/properties/invalid-nonexistent-slug');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('PROPERTY_NOT_FOUND');
  });
});
