import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Suppress unhandled XHR network errors during JSDOM React component unit tests
vi.mock('axios', async () => {
  const actual = await vi.importActual<typeof import('axios')>('axios');
  return {
    ...actual,
    default: {
      ...actual.default,
      create: () => ({
        get: vi.fn().mockRejectedValue({ response: { status: 401 } }),
        post: vi.fn().mockRejectedValue({ response: { status: 401 } }),
        interceptors: {
          request: { use: vi.fn(), eject: vi.fn() },
          response: { use: vi.fn(), eject: vi.fn() },
        },
      }),
      post: vi.fn().mockRejectedValue({ response: { status: 401 } }),
    },
  };
});
