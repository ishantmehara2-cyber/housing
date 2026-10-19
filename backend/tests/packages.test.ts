import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { db } from '../src/config/db';
import { JwtService } from '../src/services/jwt.service';
import { SessionService } from '../src/services/session.service';
import { Role } from '@housing-clone/shared';

describe('Phase 14 Monetization Packages Engine', () => {
  let adminToken: string;

  beforeAll(async () => {
    const admin = await db.user.findFirst({ where: { email: 'admin@example.test' } });
    if (admin) {
      const session = await SessionService.createSession(admin.id, 'dummy_admin_session_pkg');
      adminToken = JwtService.generateAccessToken(admin.id, admin.role as unknown as Role, session.id);
    }
  });

  it('1. GET /api/v1/packages should return active monetization packages', async () => {
    const res = await request(app).get('/api/v1/packages');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('2. ADMIN can create a new monetization package in MySQL database', async () => {
    const res = await request(app)
      .post('/api/v1/admin/packages')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Enterprise Developer Plan',
        targetRole: 'DEVELOPER',
        price: 24999,
        validityDays: 180,
        maxListings: 50,
        featuredListingsCount: 10,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.name).toBe('Enterprise Developer Plan');

    // Clean up
    await db.package.delete({ where: { id: res.body.data.id } });
  });
});
