import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/email/verification';
import { EMAIL_VERIFICATION_ENABLED } from '@/lib/constants/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, confirmPassword } = body;

    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        ...(EMAIL_VERIFICATION_ENABLED ? {} : { emailVerified: new Date() }),
      },
      select: { id: true, name: true, email: true },
    });

    if (EMAIL_VERIFICATION_ENABLED) {
      await sendVerificationEmail(email, name);
    }

    return NextResponse.json(
      { success: true, user, emailVerification: EMAIL_VERIFICATION_ENABLED },
      { status: 201 },
    );
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

