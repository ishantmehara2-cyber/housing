import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { db } from '../src/config/db';
import { JwtService } from '../src/services/jwt.service';
import { SessionService } from '../src/services/session.service';
import { Role } from '@housing-clone/shared';

describe('Phase 11 Property Visit Scheduler Engine', () => {
  let buyerToken: string;
  let testPropertyId: string;
  let createdVisitId: string;

  beforeAll(async () => {
    const buyer = await db.user.findFirst({ where: { email: 'buyer@example.test' } });
    if (buyer) {
      const session = await SessionService.createSession(buyer.id, 'dummy_buyer_session_visit');
      buyerToken = JwtService.generateAccessToken(buyer.id, buyer.role as unknown as Role, session.id);
    }

    const property = await db.property.findFirst({ where: { listingState: 'ACTIVE' } });
    if (property) {
      testPropertyId = property.id;
    }
  });

  it('1. should reject scheduling visit with past date', async () => {
    const res = await request(app)
      .post('/api/v1/property-visits')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        propertyId: testPropertyId,
        scheduledDate: '2020-01-01T10:00:00.000Z',
        timeSlot: '10:00 AM - 11:00 AM',
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_DATE');
  });

  it('2. should schedule property visit for future date', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 3);

    const res = await request(app)
      .post('/api/v1/property-visits')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        propertyId: testPropertyId,
        scheduledDate: futureDate.toISOString(),
        timeSlot: '11:00 AM - 12:00 PM',
        notes: 'Looking forward to viewing the apartment.',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('SCHEDULED');

    createdVisitId = res.body.data.id;
  });

  it('3. should retrieve user requested property visits', async () => {
    const res = await request(app)
      .get('/api/v1/property-visits')
      .set('Authorization', `Bearer ${buyerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.items)).toBe(true);
  });

  it('4. should update visit status or cancel visit request', async () => {
    if (createdVisitId) {
      const res = await request(app)
        .patch(`/api/v1/property-visits/${createdVisitId}/status`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          status: 'CANCELLED',
          notes: 'Plans changed.',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('CANCELLED');

      // Clean up
      await db.propertyVisit.delete({ where: { id: createdVisitId } });
    }
  });
});
