import { mockCollections, mockItems, mockItemTypeCounts } from '@/lib/mock-data';
import { Pin } from 'lucide-react';
import StatsCards from '@/components/dashboard/StatsCards';
import RecentCollections from '@/components/dashboard/RecentCollections';
import ItemRow from '@/components/dashboard/ItemRow';

const recentCollections = mockCollections.slice(0, 6);
const pinnedItems = mockItems.filter((i) => i.isPinned);
const recentItems = mockItems.slice(0, 10);

const totalItems = Object.values(mockItemTypeCounts).reduce((a, b) => a + b, 0);
const favoriteItems = mockItems.filter((i) => i.isFavorite).length;
const favoriteCollections = mockCollections.filter((c) => c.isFavorite).length;

export default function DashboardPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Your developer knowledge hub</p>
      </div>

      <StatsCards
        totalItems={totalItems}
        totalCollections={mockCollections.length}
        favoriteItems={favoriteItems}
        favoriteCollections={favoriteCollections}
      />

      <RecentCollections collections={recentCollections} />

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
