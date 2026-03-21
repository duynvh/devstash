import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { EMAIL_VERIFICATION_ENABLED } from '@/lib/constants/auth';
import { rateLimiters, checkRateLimit, rateLimitResponse } from '@/lib/rate-limit';

function getIPFromRequest(request?: Request): string {
  if (!request) return '127.0.0.1';
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return '127.0.0.1';
}

export async function authorizeCredentials(
  email?: string,
  password?: string,
  request?: Request,
) {
  if (!email || !password) return null;

  const ip = getIPFromRequest(request);
  const key = `${ip}:${email}`;
  const rl = await checkRateLimit(rateLimiters.login, key);

  if (!rl.success) {
    const res = rateLimitResponse(rl.reset);
    const data = await res.json();
    throw new Error(data.error);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user?.password) return null;

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return null;

  if (EMAIL_VERIFICATION_ENABLED && !user.emailVerified) {
    throw new Error('EMAIL_NOT_VERIFIED');
  }

  return { id: user.id, email: user.email, name: user.name, image: user.image };
}
