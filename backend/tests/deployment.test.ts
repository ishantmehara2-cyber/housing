import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';

describe('Phase 19 Production Deployment & Release Engineering Engine', () => {
  it('1. GET /api/v1/health should return application release version and ok status', async () => {
    const res = await request(app).get('/api/v1/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.version).toBe('1.0.0');
    expect(res.body.service).toBe('housing-clone-api');
  });

  it('2. GET /api/v1/health/ready should confirm database readiness probe', async () => {
    const res = await request(app).get('/api/v1/health/ready');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ready');
    expect(res.body.database).toBe('connected');
  });
});
