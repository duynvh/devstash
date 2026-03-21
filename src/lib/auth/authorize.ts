import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function authorizeCredentials(email?: string, password?: string) {
  if (!email || !password) return null;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user?.password) return null;

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return null;

  if (!user.emailVerified) {
    throw new Error('EMAIL_NOT_VERIFIED');
  }

  return { id: user.id, email: user.email, name: user.name, image: user.image };
}

