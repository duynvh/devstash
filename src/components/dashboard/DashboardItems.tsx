'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Pin } from 'lucide-react';
import ItemRow from './ItemRow';
import ItemDrawer from '@/components/items/ItemDrawer';
import type { ItemWithType } from '@/lib/db/items';

interface DashboardItemsProps {
  pinnedItems: ItemWithType[];
  recentItems: ItemWithType[];
}

export default function DashboardItems({ pinnedItems, recentItems }: DashboardItemsProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <>
      {pinnedItems.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Pin className="size-3.5 text-muted-foreground" />
            <h2 className="text-sm font-medium text-foreground">Pinned</h2>
          </div>
          <div className="rounded-lg border border-border divide-y divide-border overflow-hidden">
            {pinnedItems.map((item) => (
              <ItemRow key={item.id} item={item} onClick={() => setSelectedId(item.id)} />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-foreground">Recent Items</h2>
          <Link href="/items" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            View all
          </Link>
        </div>
        <div className="rounded-lg border border-border divide-y divide-border overflow-hidden">
          {recentItems.map((item) => (
            <ItemRow key={item.id} item={item} onClick={() => setSelectedId(item.id)} />
          ))}
        </div>
      </section>

      <ItemDrawer itemId={selectedId} onClose={() => setSelectedId(null)} />
    </>
  );
}
