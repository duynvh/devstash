import { resend } from './resend';
import { prisma } from '@/lib/prisma';

const BASE_URL = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
const FROM = 'onboarding@resend.dev';
export const VERIFICATION_EXPIRES_MS = 24 * 60 * 60 * 1000;

export async function createVerificationToken(
  email: string,
  expiresInMs = VERIFICATION_EXPIRES_MS
): Promise<string> {
  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + expiresInMs);

  await prisma.verificationToken.deleteMany({ where: { identifier: email } });

  await prisma.verificationToken.create({
    data: { identifier: email, token, expires },
  });

  return token;
}

export async function sendVerificationEmail(email: string, name: string): Promise<void> {
  const token = await createVerificationToken(email);
  const link = `${BASE_URL}/api/auth/verify-email?token=${token}`;

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Verify your DevStash email',
    html: buildEmailHtml(name, link),
  });
}

function buildEmailHtml(name: string, link: string): string {
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#0f0f11;color:#e5e7eb;border-radius:12px;">
      <h1 style="font-size:22px;font-weight:700;color:#fff;margin:0 0 8px;">Verify your email</h1>
      <p style="color:#9ca3af;margin:0 0 24px;">Hi ${name}, click the button below to verify your DevStash account.</p>
      <a href="${link}" style="display:inline-block;padding:12px 28px;background:#6366f1;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">Verify Email</a>
      <p style="color:#6b7280;font-size:12px;margin:24px 0 0;">This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
    </div>
  `;
}
