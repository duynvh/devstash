'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';

export type AuthFormState = {
  error?: string;
};

export async function signInWithCredentials(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) return { error: 'Email and password are required.' };

  try {
    await signIn('credentials', { email, password, redirectTo: '/dashboard' });
  } catch (err) {
    if (err instanceof AuthError) {
      const cause = (err.cause as { err?: Error } | undefined)?.err;
      if (cause?.message === 'EMAIL_NOT_VERIFIED') {
        return { error: 'Please verify your email before signing in. Check your inbox.' };
      }
      return { error: 'Invalid email or password.' };
    }
    throw err;
  }

  return {};
}

export async function signInWithGitHub() {
  await signIn('github', { redirectTo: '/dashboard' });
}

export async function registerUser(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const name = (formData.get('name') as string)?.trim();
  const email = (formData.get('email') as string)?.trim();
  const password = formData.get('password') as string;
  const confirm = formData.get('confirm') as string;

  if (!name || !email || !password || !confirm) return { error: 'All fields are required.' };
  if (password !== confirm) return { error: 'Passwords do not match.' };
  if (password.length < 8) return { error: 'Password must be at least 8 characters.' };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return { error: 'Invalid email address.' };

  const res = await fetch(`${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, confirmPassword: confirm }),
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    return { error: body.error ?? 'Registration failed. Please try again.' };
  }

  const param = body.emailVerification ? 'registered=verify' : 'registered=ready';
  redirect(`/sign-in?${param}`);
}
