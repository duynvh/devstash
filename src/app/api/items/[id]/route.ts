import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getItemById } from '@/lib/db/items';
import { DEMO_USER_EMAIL } from '@/lib/constants/demo';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: RouteParams) {
  const { id } = await params;

  const session = await auth();
  const email = session?.user?.email ?? DEMO_USER_EMAIL;
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const item = await getItemById(id, user.id);

  if (!item) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(item);
}
