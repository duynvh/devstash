'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { requestPasswordReset } from '@/actions/password-reset';
import type { PasswordResetFormState } from '@/actions/password-reset';

const initialState: PasswordResetFormState = {};

export default function ForgotPasswordForm() {
  const [state, action, isPending] = useActionState(requestPasswordReset, initialState);

  return (
    <div className="space-y-6">
      {state.success && (
        <p className="text-sm text-center text-emerald-400">{state.success}</p>
      )}

      <form action={action} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
        </div>

        {state.error && (
          <p className="text-sm text-destructive">{state.error}</p>
        )}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'Sending…' : 'Send reset link'}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Remember your password?{' '}
        <Link
          href="/sign-in"
          className="text-foreground underline underline-offset-4 hover:text-primary transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
