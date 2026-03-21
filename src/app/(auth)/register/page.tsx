import type { Metadata } from 'next';
import RegisterForm from '@/components/auth/RegisterForm';

export const metadata: Metadata = {
  title: 'Register — DevStash',
};

export default function RegisterPage() {
  return (
    <>
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-foreground">Create account</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Get started with DevStash</p>
      </div>
      <RegisterForm />
    </>
  );
}
