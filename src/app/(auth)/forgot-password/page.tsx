import type { Metadata } from 'next';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Forgot Password — DevStash',
};

export default function ForgotPasswordPage() {
  return (
    <>
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-foreground">Forgot password</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Enter your email to receive a reset link
        </p>
      </div>
      <ForgotPasswordForm />
    </>
  );
}
