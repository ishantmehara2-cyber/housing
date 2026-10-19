import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { db } from '../src/config/db';
import { JwtService } from '../src/services/jwt.service';
import { SessionService } from '../src/services/session.service';
import { Role } from '@housing-clone/shared';

describe('Phase 11 Property Enquiry Engine', () => {
  let buyerToken: string;
  let buyerUserId: string;
  let testPropertyId: string;

  beforeAll(async () => {
    const buyer = await db.user.findFirst({ where: { email: 'buyer@example.test' } });
    if (buyer) {
      buyerUserId = buyer.id;
      const session = await SessionService.createSession(buyer.id, 'dummy_buyer_session_enq');
      buyerToken = JwtService.generateAccessToken(buyer.id, buyer.role as unknown as Role, session.id);
    }

    const property = await db.property.findFirst({ where: { listingState: 'ACTIVE' } });
    if (property) {
      testPropertyId = property.id;
    }

    // Clean up any recent test enquiries/leads for this buyer & property
    if (buyerUserId && testPropertyId) {
      const oldEnquiries = await db.enquiry.findMany({ where: { userId: buyerUserId, propertyId: testPropertyId } });
      const enqIds = oldEnquiries.map((e) => e.id);
      if (enqIds.length > 0) {
        await db.lead.deleteMany({ where: { enquiryId: { in: enqIds } } });
        await db.enquiry.deleteMany({ where: { id: { in: enqIds } } });
      }
    }
  });

  it('1. should reject unauthenticated property enquiry', async () => {
    const res = await request(app)
      .post('/api/v1/enquiries')
      .send({
        propertyId: testPropertyId,
        name: 'John Buyer',
        email: 'john@buyer.test',
        phone: '9876543210',
        message: 'Interested in viewing this property.',
      });

    expect(res.status).toBe(401);
  });

  it('2. should create property enquiry and automatically generate lead for seller/agent', async () => {
    const res = await request(app)
      .post('/api/v1/enquiries')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        propertyId: testPropertyId,
        name: 'John Buyer',
        email: 'john@buyer.test',
        phone: '9876543210',
        message: 'Interested in viewing this property.',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');

    // Verify corresponding Lead created
    const lead = await db.lead.findUnique({ where: { enquiryId: res.body.data.id } });
    expect(lead).toBeDefined();
    expect(lead?.status).toBe('NEW');
  });

  it('3. should reject duplicate enquiry from same user for same property within 1 hour', async () => {
    const res = await request(app)
      .post('/api/v1/enquiries')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        propertyId: testPropertyId,
        name: 'John Buyer',
        email: 'john@buyer.test',
        phone: '9876543210',
        message: 'Interested in viewing this property.',
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('DUPLICATE_ENQUIRY');
  });
});
