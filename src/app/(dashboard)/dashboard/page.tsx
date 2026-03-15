import { mockCollections, mockItems, mockItemTypes } from '@/lib/mock-data';
import { ITEM_TYPES } from '@/lib/constants/item-types';
import { Star, Pin, FolderOpen } from 'lucide-react';
import Link from 'next/link';

const favoriteCollections = mockCollections.filter((c) => c.isFavorite);
const recentItems = mockItems.slice(0, 5);
const pinnedItems = mockItems.filter((i) => i.isPinned);

function getTypeForItem(itemTypeId: string) {
  const mockType = mockItemTypes.find((t) => t.id === itemTypeId);
  if (!mockType) return ITEM_TYPES[0];
  return ITEM_TYPES.find((t) => t.key === mockType.name + 's') ?? ITEM_TYPES[0];
}

export default function DashboardPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Your developer knowledge hub</p>
      </div>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-foreground">Collections</h2>
          <Link href="/collections" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {favoriteCollections.map((col) => (
            <Link
              key={col.id}
              href={`/collections/${col.id}`}
              className="group block rounded-lg border border-border bg-card p-4 hover:border-border/80 hover:bg-card/80 transition-all"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <FolderOpen className="size-4 text-muted-foreground shrink-0" />
                  <span className="font-medium text-sm text-foreground truncate">{col.name}</span>
                </div>
                {col.isFavorite && <Star className="size-3.5 fill-yellow-400 text-yellow-400 shrink-0 mt-0.5" />}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{col.description}</p>
              <p className="text-xs text-muted-foreground">{col.itemCount} items</p>
            </Link>
          ))}
        </div>
      </section>

      {pinnedItems.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Pin className="size-3.5 text-muted-foreground" />
            <h2 className="text-sm font-medium text-foreground">Pinned</h2>
          </div>
          <div className="rounded-lg border border-border divide-y divide-border overflow-hidden">
            {pinnedItems.map((item) => {
              const type = getTypeForItem(item.itemTypeId);
              const Icon = type.icon;
              return (
                <div key={item.id} className="flex items-center gap-3 px-4 py-3 bg-card hover:bg-muted/30 transition-colors group cursor-pointer">
                  <div className="size-7 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: `${type.color}1a` }}>
                    <Icon className="size-3.5" style={{ color: type.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                    {item.description && (
                      <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {item.isFavorite && <Star className="size-3 fill-yellow-400 text-yellow-400" />}
                    <span className="text-xs text-muted-foreground hidden sm:block">
                      {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-foreground">Recent Items</h2>
        </div>
        <div className="rounded-lg border border-border divide-y divide-border overflow-hidden">
          {recentItems.map((item) => {
            const type = getTypeForItem(item.itemTypeId);
            const Icon = type.icon;
            return (
              <div key={item.id} className="flex items-center gap-3 px-4 py-3 bg-card hover:bg-muted/30 transition-colors cursor-pointer">
                <div className="size-7 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: `${type.color}1a` }}>
                  <Icon className="size-3.5" style={{ color: type.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                  {item.description && (
                    <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {item.isFavorite && <Star className="size-3 fill-yellow-400 text-yellow-400" />}
                  <span className="text-xs text-muted-foreground hidden sm:block">
                    {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
