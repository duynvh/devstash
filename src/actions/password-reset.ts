'use server';

import { redirect } from 'next/navigation';

export type PasswordResetFormState = {
  error?: string;
  success?: string;
};

export async function requestPasswordReset(
  _prev: PasswordResetFormState,
  formData: FormData
): Promise<PasswordResetFormState> {
  const email = (formData.get('email') as string)?.trim();

  if (!email) return { error: 'Email is required.' };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return { error: 'Invalid email address.' };

  const res = await fetch(
    `${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/api/auth/forgot-password`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }
  );

  if (!res.ok) {
    return { error: 'Something went wrong. Please try again.' };
  }

  return { success: 'If an account exists with that email, a reset link has been sent.' };
}

export async function resetPassword(
  _prev: PasswordResetFormState,
  formData: FormData
): Promise<PasswordResetFormState> {
  const token = formData.get('token') as string;
  const password = formData.get('password') as string;
  const confirm = formData.get('confirm') as string;

  if (!password || !confirm) return { error: 'All fields are required.' };
  if (password.length < 8) return { error: 'Password must be at least 8 characters.' };
  if (password !== confirm) return { error: 'Passwords do not match.' };

  const res = await fetch(
    `${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/api/auth/reset-password`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password, confirmPassword: confirm }),
    }
  );

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    return { error: body.error ?? 'Something went wrong. Please try again.' };
  }

  redirect('/sign-in?reset=success');
}
