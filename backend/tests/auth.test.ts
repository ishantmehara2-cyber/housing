import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';

describe('Authentication & Session Engine', () => {
  const testEmail = `authtest_${Date.now()}_${Math.floor(Math.random() * 1000)}@example.test`;
  const testUser = {
    firstName: 'Test',
    lastName: 'User',
    email: testEmail,
    phone: `+91${Math.floor(1000000000 + Math.random() * 8000000000)}`,
    password: 'Password123!',
  };

  let accessToken: string;
  let refreshCookie: string;

  it('1. should register a new user successfully defaulting to TENANT_BUYER role', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        ...testUser,
        role: 'ADMIN', // Attempted role escalation
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data.user).toHaveProperty('id');
    expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
    expect(res.body.data.user.role).toBe('TENANT_BUYER'); // Role escalation prevented
    expect(res.body.data.user).not.toHaveProperty('passwordHash');

    // Refresh token set in HttpOnly cookie
    const cookies = res.get('Set-Cookie');
    expect(cookies).toBeDefined();
    expect(cookies?.[0]).toContain('housing_refresh_token');

    accessToken = res.body.data.accessToken;
    refreshCookie = cookies?.[0] || '';
  });

  it('2. should prevent duplicate email registration', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('EMAIL_EXISTS');
  });

  it('2b. should prevent duplicate phone registration', async () => {
    const duplicatePhoneUser = {
      firstName: 'Different',
      lastName: 'Name',
      email: `diff_${Date.now()}@example.test`,
      phone: testUser.phone,
      password: 'Password123!',
    };

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(duplicatePhoneUser);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('PHONE_EXISTS');
  });

  it('3. should authenticate user with correct login credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        identifier: testUser.email,
        password: testUser.password,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
    expect(res.body.data.user).not.toHaveProperty('passwordHash');

    const cookies = res.get('Set-Cookie');
    expect(cookies).toBeDefined();
    refreshCookie = cookies?.[0] || '';
  });

  it('4. should reject login with wrong password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        identifier: testUser.email,
        password: 'WrongPassword123!',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('5. should fetch current user profile with valid Bearer token', async () => {
    const res = await request(app)
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(testUser.email.toLowerCase());
    expect(res.body.data).not.toHaveProperty('passwordHash');
  });

  it('6. should reject protected user endpoint without Bearer token', async () => {
    const res = await request(app).get('/api/v1/users/me');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('7. should refresh session using valid HttpOnly refresh cookie', async () => {
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', [refreshCookie]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('accessToken');

    const newCookies = res.get('Set-Cookie');
    expect(newCookies).toBeDefined();
    refreshCookie = newCookies?.[0] || '';
  });

  it('8. should logout user and revoke session', async () => {
    const res = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Cookie', [refreshCookie]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
