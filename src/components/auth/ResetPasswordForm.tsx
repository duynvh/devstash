'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { resetPassword } from '@/actions/password-reset';
import type { PasswordResetFormState } from '@/actions/password-reset';

const initialState: PasswordResetFormState = {};

interface ResetPasswordFormProps {
  token: string;
  error?: string | null;
}

export default function ResetPasswordForm({ token, error }: ResetPasswordFormProps) {
  const [state, action, isPending] = useActionState(resetPassword, initialState);

  return (
    <div className="space-y-6">
      {error && (
        <p className="text-sm text-center text-destructive">{error}</p>
      )}

      <form action={action} className="space-y-4">
        <input type="hidden" name="token" value={token} />

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-foreground">
            New password
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            required
            minLength={8}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="confirm" className="text-sm font-medium text-foreground">
            Confirm new password
          </label>
          <Input
            id="confirm"
            name="confirm"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            required
            minLength={8}
          />
        </div>

        {state.error && (
          <p className="text-sm text-destructive">{state.error}</p>
        )}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'Resetting…' : 'Reset password'}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Back to{' '}
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
