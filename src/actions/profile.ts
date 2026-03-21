'use server';

import bcrypt from 'bcryptjs';
import { auth, signOut } from '@/auth';
import { prisma } from '@/lib/prisma';

export type ProfileFormState = {
  error?: string;
  success?: string;
};

export async function changePassword(
  _prev: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Not authenticated.' };

  const current = formData.get('currentPassword') as string;
  const newPass = formData.get('newPassword') as string;
  const confirm = formData.get('confirmPassword') as string;

  if (!current || !newPass || !confirm) return { error: 'All fields are required.' };
  if (newPass.length < 8) return { error: 'New password must be at least 8 characters.' };
  if (newPass !== confirm) return { error: 'Passwords do not match.' };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  });

  if (!user?.password) return { error: 'Password change is not available for OAuth accounts.' };

  const isValid = await bcrypt.compare(current, user.password);
  if (!isValid) return { error: 'Current password is incorrect.' };

  const hashed = await bcrypt.hash(newPass, 12);
  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hashed },
  });

  return { success: 'Password changed successfully.' };
}

export async function deleteAccount(): Promise<ProfileFormState> {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Not authenticated.' };

  await prisma.user.delete({ where: { id: session.user.id } });
  await signOut({ redirectTo: '/sign-in' });

  return {};
}
