import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { db } from '../src/config/db';
import { JwtService } from '../src/services/jwt.service';
import { SessionService } from '../src/services/session.service';
import { Role } from '@housing-clone/shared';

describe('Broker & Agent Marketplace API', () => {
  let adminToken: string;
  let buyerToken: string;
  let brokerToken: string;
  let createdBrokerEmail: string;

  beforeAll(async () => {
    // Admin Token
    const admin = await db.user.findFirst({ where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } } });
    if (admin) {
      const session = await SessionService.createSession(admin.id, 'dummy_admin_session_broker_test');
      adminToken = JwtService.generateAccessToken(admin.id, admin.role as unknown as Role, session.id);
    }

    // Buyer Token
    const buyer = await db.user.findFirst({ where: { role: 'TENANT_BUYER' } });
    if (buyer) {
      const session = await SessionService.createSession(buyer.id, 'dummy_buyer_session_broker_test');
      buyerToken = JwtService.generateAccessToken(buyer.id, buyer.role as unknown as Role, session.id);
    }

    // Agent/Broker User
    const agent = await db.user.findFirst({ where: { role: 'AGENT' } });
    if (agent) {
      await db.user.update({ where: { id: agent.id }, data: { status: 'ACTIVE' } });
      const session = await SessionService.createSession(agent.id, 'dummy_agent_session_broker_test');
      brokerToken = JwtService.generateAccessToken(agent.id, agent.role as unknown as Role, session.id);
    }
  });

  it('1. ADMIN can create a new broker account in MySQL database', async () => {
    createdBrokerEmail = `broker_${Date.now()}@example.test`;
    const res = await request(app)
      .post('/api/v1/admin/brokers')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        firstName: 'Apex',
        lastName: 'Realty Agent',
        email: createdBrokerEmail,
        phone: `+9199${Math.floor(10000000 + Math.random() * 80000000)}`,
        password: 'BrokerPassword123!',
        agencyName: 'Apex Realty Partners',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.email).toBe(createdBrokerEmail);

    // Clean up created broker
    await db.user.delete({ where: { id: res.body.data.id } });
  });

  it('2. GET /api/v1/brokers/directory should return paginated list of brokers', async () => {
    const res = await request(app).get('/api/v1/brokers/directory');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('brokers');
    expect(Array.isArray(res.body.data.brokers)).toBe(true);
  });

  it('3. GET /api/v1/brokers/dashboard should return broker dashboard metrics', async () => {
    const res = await request(app)
      .get('/api/v1/brokers/dashboard')
      .set('Authorization', `Bearer ${brokerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('metrics');
    expect(res.body.data.metrics).toHaveProperty('totalProperties');
  });

  it('4. GET /api/v1/brokers/properties should return broker managed properties', async () => {
    const res = await request(app)
      .get('/api/v1/brokers/properties')
      .set('Authorization', `Bearer ${brokerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('5. Normal TENANT_BUYER accessing /api/v1/brokers/dashboard should be allowed or rejected based on auth', async () => {
    const res = await request(app)
      .get('/api/v1/brokers/dashboard')
      .set('Authorization', `Bearer ${buyerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
