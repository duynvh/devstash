import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getSidebarCollections } from '@/lib/db/collections';
import { getItemTypeCounts } from '@/lib/db/items';
import { ClientShell } from './layout.client';
import { DEMO_USER_EMAIL } from '@/lib/constants/demo';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const email = session?.user?.email ?? DEMO_USER_EMAIL;

  const user = await prisma.user.findUnique({ where: { email } });

  const [itemTypeCounts, sidebarCollections] = user
    ? await Promise.all([getItemTypeCounts(user.id), getSidebarCollections(user.id)])
    : [
        {} as Record<string, number>,
        { favorites: [], recents: [] } as Awaited<ReturnType<typeof getSidebarCollections>>,
      ];

  const sessionUser = session?.user
    ? {
        name: session.user.name ?? 'User',
        email: session.user.email ?? '',
        image: session.user.image ?? null,
      }
    : {
        name: user?.name ?? 'Demo User',
        email: user?.email ?? DEMO_USER_EMAIL,
        image: null,
      };

  return (
    <ClientShell
      itemTypeCounts={itemTypeCounts}
      sidebarCollections={sidebarCollections}
      sessionUser={sessionUser}
    >
      {children}
    </ClientShell>
  );
}
