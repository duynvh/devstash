import type { Metadata } from 'next';
import SignInForm from '@/components/auth/SignInForm';

export const metadata: Metadata = {
  title: 'Sign In — DevStash',
};

const URL_ERRORS: Record<string, string> = {
  'token-expired': 'Verification link has expired. Please register again.',
  'invalid-token': 'Invalid verification link.',
  'missing-token': 'Verification token missing.',
};

interface SignInPageProps {
  searchParams: Promise<{ registered?: string; error?: string }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { registered, error } = await searchParams;

  return (
    <>
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-foreground">Sign in</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Welcome back</p>
      </div>
      <SignInForm
        registered={registered}
        urlError={error ? (URL_ERRORS[error] ?? null) : null}
      />
    </>
  );
}

