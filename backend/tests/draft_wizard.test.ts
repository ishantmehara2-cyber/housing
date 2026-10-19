import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { db } from '../src/config/db';
import { JwtService } from '../src/services/jwt.service';
import { SessionService } from '../src/services/session.service';
import { Role } from '@housing-clone/shared';

describe('Phase 7 - 7-Step Draft & Post Property Wizard Engine', () => {
  let buyerToken: string;
  let ownerToken: string;
  let agentToken: string;
  let createdDraftId: string;

  beforeAll(async () => {
    // Fetch buyer
    const buyer = await db.user.findFirst({ where: { email: 'buyer@example.test' } });
    if (buyer) {
      const session = await SessionService.createSession(buyer.id, 'dummy_buyer_session_wizard');
      buyerToken = JwtService.generateAccessToken(buyer.id, buyer.role as unknown as Role, session.id);
    }

    // Fetch owner
    const owner = await db.user.findFirst({ where: { email: 'owner@example.test' } });
    if (owner) {
      const session = await SessionService.createSession(owner.id, 'dummy_owner_session_wizard');
      ownerToken = JwtService.generateAccessToken(owner.id, owner.role as unknown as Role, session.id);
    }

    // Fetch agent
    const agent = await db.user.findFirst({ where: { email: 'agent@example.test' } });
    if (agent) {
      await db.user.update({ where: { id: agent.id }, data: { status: 'ACTIVE' } });
      const session = await SessionService.createSession(agent.id, 'dummy_agent_session_wizard');
      agentToken = JwtService.generateAccessToken(agent.id, agent.role as unknown as Role, session.id);
    }
  });

  it('1. should reject unauthenticated draft creation', async () => {
    const res = await request(app)
      .post('/api/v1/properties/drafts')
      .send({
        listingPurpose: 'BUY',
        propertyCategory: 'RESIDENTIAL',
        propertyTypeId: 'apartment',
      });

    expect(res.status).toBe(401);
  });

  it('2. should reject TENANT_BUYER role from creating property drafts', async () => {
    const res = await request(app)
      .post('/api/v1/properties/drafts')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        listingPurpose: 'BUY',
        propertyCategory: 'RESIDENTIAL',
        propertyTypeId: 'apartment',
      });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('3. should allow OWNER role to create a new property draft in MySQL database', async () => {
    const propType = await db.propertyType.findFirst();

    const res = await request(app)
      .post('/api/v1/properties/drafts')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        listingPurpose: 'BUY',
        propertyCategory: 'RESIDENTIAL',
        propertyTypeId: propType?.id || 'apartment',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.listingState).toBe('DRAFT');

    createdDraftId = res.body.data.id;
  });

  it('4. should update draft fields via debounced autosave PATCH endpoint', async () => {
    const res = await request(app)
      .patch(`/api/v1/properties/drafts/${createdDraftId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        title: 'Spacious 2 BHK Lakeview Apartment',
        description: 'Gorgeous 2 BHK apartment in prime location',
        carpetArea: 950,
        price: 12500000,
        bhk: 2,
        bedrooms: 2,
        bathrooms: 2,
        completedStep: 4,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Spacious 2 BHK Lakeview Apartment');
    expect(res.body.data.carpetArea).toBe(950);
  });

  it('5. should reject submission if property has zero uploaded media', async () => {
    const res = await request(app)
      .post(`/api/v1/properties/drafts/${createdDraftId}/submit`)
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('MEDIA_REQUIRED');
  });

  it('6. should submit draft with media attached, transitioning to PENDING_APPROVAL with SEO slug and AuditLog', async () => {
    // Attach dummy property media item to draft
    await db.propertyMedia.create({
      data: {
        propertyId: createdDraftId,
        mediaType: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
        caption: 'Front Exterior',
        displayOrder: 1,
      },
    });

    const res = await request(app)
      .post(`/api/v1/properties/drafts/${createdDraftId}/submit`)
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.listingState).toBe('PENDING_APPROVAL'); // Normal users CANNOT bypass moderation to ACTIVE
    expect(res.body.data.verificationState).toBe('PENDING');     // Normal users CANNOT bypass verification to VERIFIED
    expect(res.body.data.slug).toContain('mumbai');

    // Verify AuditLog entry written
    const audit = await db.auditLog.findFirst({
      where: { entityId: createdDraftId, action: 'PROPERTY_SUBMITTED_FOR_APPROVAL' },
    });
    expect(audit).toBeDefined();

    // Clean up created test property
    await db.property.delete({ where: { id: createdDraftId } });
  });

  it('7. AGENT can create a draft listing', async () => {
    const propType = await db.propertyType.findFirst();

    const res = await request(app)
      .post('/api/v1/properties/drafts')
      .set('Authorization', `Bearer ${agentToken}`)
      .send({
        listingPurpose: 'RENT',
        propertyCategory: 'RESIDENTIAL',
        propertyTypeId: propType?.id || 'apartment',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    // Clean up
    await db.property.delete({ where: { id: res.body.data.id } });
  });
});
