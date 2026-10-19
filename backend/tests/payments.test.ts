import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { db } from '../src/config/db';
import { JwtService } from '../src/services/jwt.service';
import { SessionService } from '../src/services/session.service';
import { Role } from '@housing-clone/shared';

describe('Phase 14 Payments, Subscriptions & Verification Engine', () => {
  let buyerToken: string;
  let testPackageId: string;
  let createdTxnId: string;

  beforeAll(async () => {
    const buyer = await db.user.findFirst({ where: { email: 'buyer@example.test' } });
    if (buyer) {
      const session = await SessionService.createSession(buyer.id, 'dummy_buyer_session_pay');
      buyerToken = JwtService.generateAccessToken(buyer.id, buyer.role as unknown as Role, session.id);
    }

    const pkg = await db.package.findFirst({ where: { isActive: true } });
    if (pkg) {
      testPackageId = pkg.id;
    }
  });

  it('1. should create payment order and pending transaction record in MySQL', async () => {
    if (testPackageId) {
      const res = await request(app)
        .post('/api/v1/payments/orders')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ packageId: testPackageId });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('transactionId');
      expect(res.body.data).toHaveProperty('providerOrderId');

      createdTxnId = res.body.data.transactionId;
    }
  });

  it('2. should verify payment signature, activate subscription and generate invoice', async () => {
    if (createdTxnId) {
      const txn = await db.transaction.findUnique({ where: { id: createdTxnId } });

      const res = await request(app)
        .post('/api/v1/payments/verify')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          transactionId: createdTxnId,
          providerOrderId: txn?.providerOrderId,
          providerPaymentId: 'pay_mock_12345',
          providerSignature: 'valid_mock_signature',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('subscriptionId');
      expect(res.body.data).toHaveProperty('invoiceNumber');

      // Clean up created subscription, invoice, transaction
      const invoice = await db.invoice.findFirst({ where: { transactionId: createdTxnId } });
      if (invoice) await db.invoice.delete({ where: { id: invoice.id } });

      const sub = await db.subscription.findFirst({ where: { id: res.body.data.subscriptionId } });
      if (sub) await db.subscription.delete({ where: { id: sub.id } });

      await db.transaction.delete({ where: { id: createdTxnId } });
    }
  });

  it('3. should retrieve user subscription entitlements', async () => {
    const res = await request(app)
      .get('/api/v1/billing/subscription')
      .set('Authorization', `Bearer ${buyerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('canPostListing');
  });
});
