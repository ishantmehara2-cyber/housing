import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';

describe('Phase 17 Production Observability, Readiness & Request Correlation Engine', () => {
  it('1. HTTP responses should include X-Request-ID correlation header', async () => {
    const res = await request(app).get('/api/v1/health');

    expect(res.status).toBe(200);
    expect(res.header).toHaveProperty('x-request-id');
  });

  it('2. GET /api/v1/health/ready should perform database probe and return 200 OK', async () => {
    const res = await request(app).get('/api/v1/health/ready');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ready');
    expect(res.body.database).toBe('connected');
  });
});
