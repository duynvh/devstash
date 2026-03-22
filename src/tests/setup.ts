import { vi } from 'vitest';

process.env.DATABASE_URL = 'postgresql://test:test@localhost/testdb';
process.env.NEXTAUTH_SECRET = 'test-secret';
process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io';
process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';

vi.mock('@/lib/rate-limit', () => ({
  rateLimiters: {
    login: {},
    register: {},
    forgotPassword: {},
    resetPassword: {},
    resendVerification: {},
  },
  checkRateLimit: vi.fn().mockResolvedValue({ success: true, remaining: 10, reset: 0 }),
  getIP: vi.fn().mockReturnValue('127.0.0.1'),
  rateLimitResponse: vi.fn(),
}));
