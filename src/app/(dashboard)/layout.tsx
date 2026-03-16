import { prisma } from '@/lib/prisma';
import { getSidebarCollections } from '@/lib/db/collections';
import { getItemTypeCounts } from '@/lib/db/items';
import { ClientShell } from './layout.client';

const DEMO_USER_EMAIL = 'demo@devstash.io';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await prisma.user.findUnique({ where: { email: DEMO_USER_EMAIL } });

  const [itemTypeCounts, sidebarCollections] = user
    ? await Promise.all([getItemTypeCounts(user.id), getSidebarCollections(user.id)])
    : [
        {} as Record<string, number>,
        { favorites: [], recents: [] } as Awaited<ReturnType<typeof getSidebarCollections>>,
      ];

  return (
    <ClientShell itemTypeCounts={itemTypeCounts} sidebarCollections={sidebarCollections}>
      {children}
    </ClientShell>
  );
}
