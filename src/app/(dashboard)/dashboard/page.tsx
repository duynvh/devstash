import { Pin } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { getRecentCollections, getCollectionStats } from '@/lib/db/collections';
import { getPinnedItems, getRecentItems } from '@/lib/db/items';
import StatsCards from '@/components/dashboard/StatsCards';
import RecentCollections from '@/components/dashboard/RecentCollections';
import ItemRow from '@/components/dashboard/ItemRow';
import Link from 'next/link';
import { DEMO_USER_EMAIL } from '@/lib/constants/demo';

async function getDemoUser() {
  return prisma.user.findUnique({ where: { email: DEMO_USER_EMAIL } });
}

async function getItemStats(userId: string) {
  const [totalItems, favoriteItems] = await Promise.all([
    prisma.item.count({ where: { userId } }),
    prisma.item.count({ where: { userId, isFavorite: true } }),
  ]);
  return { totalItems, favoriteItems };
}

export default async function DashboardPage() {
  const user = await getDemoUser();

  if (!user) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Your developer knowledge hub</p>
        </div>
        <p className="text-sm text-muted-foreground">No data found.</p>
      </div>
    );
  }

  const [collections, collectionStats, itemStats, pinnedItems, recentItems] = await Promise.all([
    getRecentCollections(user.id),
    getCollectionStats(user.id),
    getItemStats(user.id),
    getPinnedItems(user.id),
    getRecentItems(user.id),
  ]);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Your developer knowledge hub</p>
      </div>

      <StatsCards
        totalItems={itemStats.totalItems}
        totalCollections={collectionStats.totalCollections}
        favoriteItems={itemStats.favoriteItems}
        favoriteCollections={collectionStats.favoriteCollections}
      />

      <RecentCollections collections={collections} />

      {pinnedItems.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Pin className="size-3.5 text-muted-foreground" />
            <h2 className="text-sm font-medium text-foreground">Pinned</h2>
          </div>
          <div className="rounded-lg border border-border divide-y divide-border overflow-hidden">
            {pinnedItems.map((item) => (
              <ItemRow key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-foreground">Recent Items</h2>
          <Link
            href="/items"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            View all
          </Link>
        </div>
        <div className="rounded-lg border border-border divide-y divide-border overflow-hidden">
          {recentItems.map((item) => (
            <ItemRow key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
