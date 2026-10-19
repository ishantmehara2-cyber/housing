import { describe, it, expect } from 'vitest';
import { useAuthStore } from '../store/useAuthStore';
import { Role, UserStatus } from '@housing-clone/shared';

describe('Frontend Auth Store', () => {
  it('1. should initialize in logged out state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('2. should set user and access token on setAuth', () => {
    const dummyUser = {
      id: 'usr_123',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      phone: null,
      avatarUrl: null,
      role: Role.TENANT_BUYER,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      phoneVerified: false,
      createdAt: new Date().toISOString(),
    };

    useAuthStore.getState().setAuth(dummyUser, 'dummy_access_token');

    const state = useAuthStore.getState();
    expect(state.user?.id).toBe('usr_123');
    expect(state.accessToken).toBe('dummy_access_token');
    expect(state.isAuthenticated).toBe(true);
  });

  it('3. should clear auth on clearAuth', () => {
    useAuthStore.getState().clearAuth();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });
});
