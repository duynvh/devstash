import type { Metadata } from 'next';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

export const metadata: Metadata = {
  title: 'Reset Password — DevStash',
};

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { token } = await searchParams;

  const error = token ? null : 'Missing reset token. Please request a new reset link.';

  return (
    <>
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-foreground">Reset password</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Enter your new password</p>
      </div>
      <ResetPasswordForm token={token ?? ''} error={error} />
    </>
  );
}
