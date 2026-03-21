import type { Metadata } from 'next';
import SignInForm from '@/components/auth/SignInForm';

export const metadata: Metadata = {
  title: 'Sign In — DevStash',
};

interface SignInPageProps {
  searchParams: Promise<{ registered?: string }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { registered } = await searchParams;

  return (
    <>
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-foreground">Sign in</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Welcome back</p>
      </div>
      <SignInForm registered={registered === '1'} />
    </>
  );
}
