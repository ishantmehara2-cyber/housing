import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { db } from '../src/config/db';
import { JwtService } from '../src/services/jwt.service';
import { SessionService } from '../src/services/session.service';
import { Role } from '@housing-clone/shared';

describe('Phase 17 Event Analytics Engine', () => {
  let adminToken: string;

  beforeAll(async () => {
    const admin = await db.user.findFirst({ where: { email: 'admin@example.test' } });
    if (admin) {
      const session = await SessionService.createSession(admin.id, 'dummy_admin_session_an');
      adminToken = JwtService.generateAccessToken(admin.id, admin.role as unknown as Role, session.id);
    }
  });

  it('1. POST /api/v1/analytics/events should record analytics event', async () => {
    const res = await request(app)
      .post('/api/v1/analytics/events')
      .send({
        eventName: 'property_view',
        metadata: { page: 'PropertyDetailPage', source: 'Search' },
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');

    // Clean up
    await db.analyticsEvent.delete({ where: { id: res.body.data.id } });
  });

  it('2. GET /api/v1/admin/analytics/summary should return product analytics summary for ADMIN', async () => {
    const res = await request(app)
      .get('/api/v1/admin/analytics/summary')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('eventMetrics');
    expect(res.body.data).toHaveProperty('topProperties');
  });
});
