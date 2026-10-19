import { create } from 'zustand';
import { UserSummary } from '@housing-clone/shared';

interface AuthState {
  user: UserSummary | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  setAuth: (user: UserSummary, accessToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  setUser: (user: UserSummary) => void;
  clearAuth: () => void;
  setInitializing: (isInitializing: boolean) => void;
}

// In-memory access token storage (Security: Never stored in localStorage / sessionStorage)
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isInitializing: true,
  setAuth: (user, accessToken) =>
    set({
      user,
      accessToken,
      isAuthenticated: true,
      isInitializing: false,
    }),
  setAccessToken: (accessToken) =>
    set({
      accessToken,
      isAuthenticated: true,
    }),
  setUser: (user) => set({ user }),
  clearAuth: () =>
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isInitializing: false,
    }),
  setInitializing: (isInitializing) => set({ isInitializing }),
}));
