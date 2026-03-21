import { resend } from './resend';
import { createVerificationToken } from './verification';

const BASE_URL = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
const FROM = 'onboarding@resend.dev';
const RESET_EXPIRES_MS = 60 * 60 * 1000;

export async function sendPasswordResetEmail(email: string): Promise<void> {
  const token = await createVerificationToken(email, RESET_EXPIRES_MS);
  const link = `${BASE_URL}/reset-password?token=${token}`;

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Reset your DevStash password',
    html: buildResetEmailHtml(link),
  });
}

function buildResetEmailHtml(link: string): string {
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#0f0f11;color:#e5e7eb;border-radius:12px;">
      <h1 style="font-size:22px;font-weight:700;color:#fff;margin:0 0 8px;">Reset your password</h1>
      <p style="color:#9ca3af;margin:0 0 24px;">Click the button below to set a new password for your DevStash account.</p>
      <a href="${link}" style="display:inline-block;padding:12px 28px;background:#6366f1;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">Reset Password</a>
      <p style="color:#6b7280;font-size:12px;margin:24px 0 0;">This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
    </div>
  `;
}
