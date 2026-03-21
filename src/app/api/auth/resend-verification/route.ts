import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/email/verification';
import { EMAIL_VERIFICATION_ENABLED } from '@/lib/constants/auth';
import { rateLimiters, getIP, checkRateLimit, rateLimitResponse } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const ip = getIP(request);

  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const rl = await checkRateLimit(rateLimiters.resendVerification, `${ip}:${email}`);
    if (!rl.success) return rateLimitResponse(rl.reset);

    if (!EMAIL_VERIFICATION_ENABLED) {
      return NextResponse.json({ error: 'Email verification is disabled' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (user && !user.emailVerified) {
      await sendVerificationEmail(email, user.name ?? '');
    }

    return NextResponse.json({
      success: true,
      message: 'If your email is registered and unverified, a new verification link has been sent.',
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
