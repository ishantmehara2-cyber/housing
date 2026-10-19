import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';

describe('Phase 5 Property Search Engine', () => {
  it('1. Empty search returns active listings with pagination metadata', async () => {
    const res = await request(app).get('/api/v1/search/properties');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.items)).toBe(true);
    expect(res.body.data.items.length).toBeGreaterThan(0);
    expect(res.body.data.pagination).toHaveProperty('total');
    expect(res.body.data.pagination.page).toBe(1);
  });

  it('2. Search by city (Mumbai)', async () => {
    const res = await request(app).get('/api/v1/search/properties?city=mumbai');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items.length).toBeGreaterThan(0);
    expect(res.body.data.items[0].city.slug).toBe('mumbai');
  });

  it('3. Search by locality (Powai)', async () => {
    const res = await request(app).get('/api/v1/search/properties?locality=powai');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items.length).toBeGreaterThan(0);
    expect(res.body.data.items[0].locality.slug).toBe('powai');
  });

  it('4. Search by listing purpose (BUY)', async () => {
    const res = await request(app).get('/api/v1/search/properties?listingPurpose=BUY');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items.every((p: { listingPurpose: string }) => p.listingPurpose === 'BUY')).toBe(true);
  });

  it('5. Search by property type (apartment)', async () => {
    const res = await request(app).get('/api/v1/search/properties?propertyType=apartment');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items.every((p: { propertyType: { slug: string } }) => p.propertyType.slug === 'apartment')).toBe(true);
  });

  it('6. Search by minimum and maximum price range', async () => {
    const res = await request(app).get('/api/v1/search/properties?minPrice=10000000&maxPrice=30000000');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items.length).toBeGreaterThan(0);
    expect(res.body.data.items[0].price).toBeGreaterThanOrEqual(10000000);
    expect(res.body.data.items[0].price).toBeLessThanOrEqual(30000000);
  });

  it('7. Search by BHK (3 BHK)', async () => {
    const res = await request(app).get('/api/v1/search/properties?bhk=3');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items.every((p: { bhk: number }) => p.bhk === 3)).toBe(true);
  });

  it('8. Search by area range (carpetArea)', async () => {
    const res = await request(app).get('/api/v1/search/properties?minCarpetArea=1000&maxCarpetArea=2000');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items.length).toBeGreaterThan(0);
    expect(res.body.data.items[0].carpetArea).toBeGreaterThanOrEqual(1000);
  });

  it('9. Search by furnishing (FULLY_FURNISHED)', async () => {
    const res = await request(app).get('/api/v1/search/properties?furnishing=FULLY_FURNISHED');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items.every((p: { furnishing: string }) => p.furnishing === 'FULLY_FURNISHED')).toBe(true);
  });

  it('10. Search by verification state (VERIFIED)', async () => {
    const res = await request(app).get('/api/v1/search/properties?verificationState=VERIFIED');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items.every((p: { verificationState: string }) => p.verificationState === 'VERIFIED')).toBe(true);
  });

  it('11. Search by single amenity (lift)', async () => {
    const res = await request(app).get('/api/v1/search/properties?amenities=lift');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items.length).toBeGreaterThan(0);
  });

  it('12. Search by multiple amenities with ALL mode (lift,swimming-pool)', async () => {
    const res = await request(app).get('/api/v1/search/properties?amenities=lift,swimming-pool&amenityMode=all');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items.length).toBeGreaterThan(0);
  });

  it('13. Search by project (apex-horizon-heights)', async () => {
    const res = await request(app).get('/api/v1/search/properties?project=apex-horizon-heights');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items[0].project.slug).toBe('apex-horizon-heights');
  });

  it('14. Search by developer (apex-realty)', async () => {
    const res = await request(app).get('/api/v1/search/properties?developer=apex-realty');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items[0].developerOrganization.slug).toBe('apex-realty');
  });

  it('15. Search by free text query q=Powai', async () => {
    const res = await request(app).get('/api/v1/search/properties?q=Powai');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items.length).toBeGreaterThan(0);
  });

  it('16. Combined multi-criteria search (mumbai + BUY + 3 BHK)', async () => {
    const res = await request(app).get('/api/v1/search/properties?city=mumbai&listingPurpose=BUY&bhk=3');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items.length).toBeGreaterThan(0);
    expect(res.body.data.items[0].city.slug).toBe('mumbai');
    expect(res.body.data.items[0].listingPurpose).toBe('BUY');
    expect(res.body.data.items[0].bhk).toBe(3);
  });

  it('17. Sorting by price_asc and price_desc', async () => {
    const resAsc = await request(app).get('/api/v1/search/properties?sortBy=price_asc');
    expect(resAsc.status).toBe(200);

    const resDesc = await request(app).get('/api/v1/search/properties?sortBy=price_desc');
    expect(resDesc.status).toBe(200);
  });

  it('18. Sorting by area_asc and area_desc', async () => {
    const res = await request(app).get('/api/v1/search/properties?sortBy=area_desc');
    expect(res.status).toBe(200);
  });

  it('19. Pagination with limit=1', async () => {
    const res = await request(app).get('/api/v1/search/properties?page=1&limit=1');

    expect(res.status).toBe(200);
    expect(res.body.data.items.length).toBe(1);
    expect(res.body.data.pagination.limit).toBe(1);
    expect(res.body.data.pagination.totalPages).toBeGreaterThanOrEqual(1);
  });

  it('20. Reject limit exceeding maximum allowed (limit=100)', async () => {
    const res = await request(app).get('/api/v1/search/properties?limit=100');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('21. Reject invalid page number (page=0)', async () => {
    const res = await request(app).get('/api/v1/search/properties?page=0');

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('22. Reject un-whitelisted sort option', async () => {
    const res = await request(app).get('/api/v1/search/properties?sortBy=unsupported_sort_field');

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('23. Reject invalid price range where minPrice > maxPrice', async () => {
    const res = await request(app).get('/api/v1/search/properties?minPrice=50000000&maxPrice=1000000');

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('24. Reject invalid coordinate values', async () => {
    const res = await request(app).get('/api/v1/search/properties?minLat=120');

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('25. Map bounding-box search (minLat, maxLat, minLng, maxLng)', async () => {
    const res = await request(app).get('/api/v1/search/properties?minLat=18.0&maxLat=20.0&minLng=72.0&maxLng=74.0');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items.length).toBeGreaterThan(0);
  });

  it('26. No-result search returns empty items array with 0 total', async () => {
    const res = await request(app).get('/api/v1/search/properties?city=non-existent-city-slug');

    expect(res.status).toBe(200);
    expect(res.body.data.items.length).toBe(0);
    expect(res.body.data.pagination.total).toBe(0);
  });

  it('27. Search results do not leak sensitive user/session data', async () => {
    const res = await request(app).get('/api/v1/search/properties');

    expect(res.status).toBe(200);
    for (const item of res.body.data.items) {
      expect(item).not.toHaveProperty('passwordHash');
      expect(item).not.toHaveProperty('refreshToken');
      expect(item).not.toHaveProperty('otpHash');
    }
  });
});
