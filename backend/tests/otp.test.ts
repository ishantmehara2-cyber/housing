import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { db } from '../src/config/db';

describe('OTP Engine & Password Reset Flow', () => {
  const testPhone = `+91${Math.floor(1000000000 + Math.random() * 8000000000)}`;

  it('1. should generate and send OTP for PHONE_VERIFY', async () => {
    const res = await request(app)
      .post('/api/v1/auth/otp/send')
      .send({
        identifier: testPhone,
        purpose: 'PHONE_VERIFY',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify OTP record created in DB
    const otpRecord = await db.otpVerification.findFirst({
      where: { identifier: testPhone, purpose: 'PHONE_VERIFY' },
    });
    expect(otpRecord).toBeDefined();
    expect(otpRecord?.otpHash).toBeDefined();
    expect(otpRecord?.verifiedAt).toBeNull();
  });

  it('2. should reject verification with incorrect OTP', async () => {
    const res = await request(app)
      .post('/api/v1/auth/otp/verify')
      .send({
        identifier: testPhone,
        otp: '000000',
        purpose: 'PHONE_VERIFY',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_OTP');
  });

  it('3. should request password reset without leaking user existence', async () => {
    const res = await request(app)
      .post('/api/v1/auth/password-reset/request')
      .send({
        identifier: 'nonexistent_user@example.test',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('password reset OTP has been sent');
  });
});
