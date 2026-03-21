'use client';

import { useActionState } from 'react';
import { changePassword, type ProfileFormState } from '@/actions/profile';

const initialState: ProfileFormState = {};

export default function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changePassword, initialState);

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="text-sm font-medium text-foreground mb-4">Change Password</h3>

      <form action={action} className="space-y-3">
        <input
          name="currentPassword"
          type="password"
          placeholder="Current password"
          required
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <input
          name="newPassword"
          type="password"
          placeholder="New password"
          required
          minLength={8}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <input
          name="confirmPassword"
          type="password"
          placeholder="Confirm new password"
          required
          minLength={8}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />

        {state.error && (
          <p className="text-sm text-destructive">{state.error}</p>
        )}
        {state.success && (
          <p className="text-sm text-emerald-500">{state.success}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {pending ? 'Changing…' : 'Change Password'}
        </button>
      </form>
    </div>
  );
}
