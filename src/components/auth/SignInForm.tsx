'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signInWithCredentials, signInWithGitHub } from '@/actions/auth';
import type { AuthFormState } from '@/actions/auth';

const initialState: AuthFormState = {};

export default function SignInForm({ registered }: { registered?: boolean }) {
  const [state, action, isPending] = useActionState(signInWithCredentials, initialState);

  return (
    <div className="space-y-6">
      {registered && (
        <p className="text-sm text-center text-emerald-400">
          Account created! Sign in below.
        </p>
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

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-foreground">
            Password
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            required
          />
        </div>

        {state.error && (
          <p className="text-sm text-destructive">{state.error}</p>
        )}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs text-muted-foreground">
          <span className="bg-card px-2">or</span>
        </div>
      </div>

      <form action={signInWithGitHub}>
        <Button type="submit" variant="outline" className="w-full gap-2">
          <Github className="size-4" />
          Sign in with GitHub
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-foreground underline underline-offset-4 hover:text-primary transition-colors">
          Register
        </Link>
      </p>
    </div>
  );
}
