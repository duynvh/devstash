'use client';

import { useState } from 'react';
import ItemCard from './ItemCard';
import ItemDrawer from './ItemDrawer';
import type { ItemWithType } from '@/lib/db/items';

interface ItemsWithDrawerProps {
  items: ItemWithType[];
}

export default function ItemsWithDrawer({ items }: ItemsWithDrawerProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <ItemCard key={item.id} item={item} onClick={() => setSelectedId(item.id)} />
        ))}
      </div>
      <ItemDrawer itemId={selectedId} onClose={() => setSelectedId(null)} />
    </>
  );
}
