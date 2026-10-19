import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { db } from '../src/config/db';
import { JwtService } from '../src/services/jwt.service';
import { SessionService } from '../src/services/session.service';
import { Role } from '@housing-clone/shared';

describe('Phase 6 Media Management & S3 Direct Uploads', () => {
  let buyerToken: string;
  let ownerToken: string;
  let adminToken: string;
  let testPropertyId: string;

  beforeAll(async () => {
    // Fetch seeded buyer user
    const buyer = await db.user.findFirst({ where: { email: 'buyer@example.test' } });
    if (buyer) {
      const session = await SessionService.createSession(buyer.id, 'dummy_buyer_session_media');
      buyerToken = JwtService.generateAccessToken(buyer.id, buyer.role as unknown as Role, session.id);
    }

    // Fetch seeded owner user
    const owner = await db.user.findFirst({ where: { email: 'owner@example.test' } });
    if (owner) {
      const session = await SessionService.createSession(owner.id, 'dummy_owner_session_media');
      ownerToken = JwtService.generateAccessToken(owner.id, owner.role as unknown as Role, session.id);
    }

    // Fetch seeded admin user
    const admin = await db.user.findFirst({ where: { email: 'admin@example.test' } });
    if (admin) {
      const session = await SessionService.createSession(admin.id, 'dummy_admin_session_media');
      adminToken = JwtService.generateAccessToken(admin.id, admin.role as unknown as Role, session.id);
    }

    // Fetch property owned by owner@example.test
    const property = await db.property.findFirst({ where: { owner: { email: 'owner@example.test' } } });
    if (property) {
      testPropertyId = property.id;
    }
  });

  it('1. should reject unauthenticated request for presigned upload URL', async () => {
    const res = await request(app)
      .post('/api/v1/media/presign')
      .send({
        resourceType: 'PROPERTY',
        resourceId: testPropertyId,
        mediaType: 'IMAGE',
        fileName: 'test.jpg',
        contentType: 'image/jpeg',
        fileSize: 102400,
      });

    expect(res.status).toBe(401);
  });

  it('2. should reject TENANT_BUYER requesting upload for property listing', async () => {
    const res = await request(app)
      .post('/api/v1/media/presign')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        resourceType: 'PROPERTY',
        resourceId: testPropertyId,
        mediaType: 'IMAGE',
        fileName: 'test.jpg',
        contentType: 'image/jpeg',
        fileSize: 102400,
      });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('3. should generate presigned upload URL for property owner without leaking secrets', async () => {
    const res = await request(app)
      .post('/api/v1/media/presign')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        resourceType: 'PROPERTY',
        resourceId: testPropertyId,
        mediaType: 'IMAGE',
        fileName: 'bedroom.jpg',
        contentType: 'image/jpeg',
        fileSize: 102400,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('uploadUrl');
    expect(res.body.data).toHaveProperty('objectKey');
    expect(res.body.data.objectKey).toContain(`properties/${testPropertyId}/image/`);
    expect(res.body.data).not.toHaveProperty('accessKeyId');
    expect(res.body.data).not.toHaveProperty('secretAccessKey');
  });

  it('4. should reject upload with invalid MIME type for mediaType IMAGE', async () => {
    const res = await request(app)
      .post('/api/v1/media/presign')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        resourceType: 'PROPERTY',
        resourceId: testPropertyId,
        mediaType: 'IMAGE',
        fileName: 'malicious.exe',
        contentType: 'application/x-msdownload',
        fileSize: 102400,
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_FILE_TYPE');
  });

  it('5. should reject upload exceeding maximum file size limit', async () => {
    const res = await request(app)
      .post('/api/v1/media/presign')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        resourceType: 'PROPERTY',
        resourceId: testPropertyId,
        mediaType: 'IMAGE',
        fileName: 'huge.jpg',
        contentType: 'image/jpeg',
        fileSize: 50 * 1024 * 1024, // 50MB (exceeds 10MB limit)
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('FILE_TOO_LARGE');
  });

  it('6. should complete upload and persist media metadata in MySQL database', async () => {
    const res = await request(app)
      .post('/api/v1/media/complete')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        resourceType: 'PROPERTY',
        resourceId: testPropertyId,
        mediaType: 'IMAGE',
        objectKey: `properties/${testPropertyId}/image/uuid-123.jpg`,
        url: `http://127.0.0.1:9000/housing-media/properties/${testPropertyId}/image/uuid-123.jpg`,
        caption: 'Master Living Area',
        fileSize: 204800,
        mimeType: 'image/jpeg',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.url).toContain('uuid-123.jpg');

    // Clean up created test media record
    await db.propertyMedia.delete({ where: { id: res.body.data.id } });
  });

  it('7. ADMIN can generate presigned download URL for private property document', async () => {
    // Get existing property media record
    const media = await db.propertyMedia.findFirst({ where: { propertyId: testPropertyId } });
    if (media) {
      const res = await request(app)
        .get(`/api/v1/media/${media.id}/download`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('downloadUrl');
    }
  });
});
