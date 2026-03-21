import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextRequest } from 'next/server';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

function createLimiter(requests: number, window: `${number} ${'s' | 'm' | 'h' | 'd'}`) {
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: false,
  });
}

export const rateLimiters = {
  login: createLimiter(5, '15 m'),
  register: createLimiter(3, '1 h'),
  forgotPassword: createLimiter(3, '1 h'),
  resetPassword: createLimiter(5, '15 m'),
  resendVerification: createLimiter(3, '15 m'),
};

export function getIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return '127.0.0.1';
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
}

export async function checkRateLimit(
  limiter: Ratelimit,
  key: string,
): Promise<RateLimitResult> {
  try {
    const { success, remaining, reset } = await limiter.limit(key);
    return { success, remaining, reset };
  } catch {
    return { success: true, remaining: 0, reset: 0 };
  }
}

export function rateLimitResponse(reset: number) {
  const retryAfterSeconds = Math.ceil((reset - Date.now()) / 1000);
  const minutes = Math.ceil(retryAfterSeconds / 60);
  return Response.json(
    { error: `Too many attempts. Please try again in ${minutes} minute${minutes !== 1 ? 's' : ''}.` },
    {
      status: 429,
      headers: { 'Retry-After': String(retryAfterSeconds) },
    },
  );
}
