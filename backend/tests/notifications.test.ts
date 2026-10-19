import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { db } from '../src/config/db';
import { JwtService } from '../src/services/jwt.service';
import { SessionService } from '../src/services/session.service';
import { Role } from '@housing-clone/shared';
import { NotificationService } from '../src/services/notification/notification.service';

describe('Phase 11 Notification System Engine', () => {
  let buyerToken: string;
  let buyerUserId: string;
  let createdNotifId: string;

  beforeAll(async () => {
    const buyer = await db.user.findFirst({ where: { email: 'buyer@example.test' } });
    if (buyer) {
      buyerUserId = buyer.id;
      const session = await SessionService.createSession(buyer.id, 'dummy_buyer_session_notif');
      buyerToken = JwtService.generateAccessToken(buyer.id, buyer.role as unknown as Role, session.id);
    }
  });

  it('1. should create in-app notification', async () => {
    const notif = await NotificationService.createNotification(
      buyerUserId,
      'Test Notification Title',
      'This is a test notification message.',
      'SYSTEM'
    );

    expect(notif).toHaveProperty('id');
    expect(notif.title).toBe('Test Notification Title');
    createdNotifId = notif.id;
  });

  it('2. should fetch user notifications list and unread count', async () => {
    const resCount = await request(app)
      .get('/api/v1/notifications/unread-count')
      .set('Authorization', `Bearer ${buyerToken}`);

    expect(resCount.status).toBe(200);
    expect(resCount.body.data.unreadCount).toBeGreaterThanOrEqual(1);

    const resList = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${buyerToken}`);

    expect(resList.status).toBe(200);
    expect(Array.isArray(resList.body.data.items)).toBe(true);
  });

  it('3. should mark notification as read', async () => {
    if (createdNotifId) {
      const res = await request(app)
        .patch(`/api/v1/notifications/${createdNotifId}/read`)
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Clean up
      await db.notification.delete({ where: { id: createdNotifId } });
    }
  });
});
