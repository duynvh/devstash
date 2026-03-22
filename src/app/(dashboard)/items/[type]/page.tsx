import { createElement } from 'react';
import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getItemsByType } from '@/lib/db/items';
import { ITEM_TYPES } from '@/lib/constants/item-types';
import { DEMO_USER_EMAIL } from '@/lib/constants/demo';
import ItemsWithDrawer from '@/components/items/ItemsWithDrawer';
import type { ItemTypeKey } from '@/lib/constants/item-types';

interface ItemsPageProps {
  params: Promise<{ type: string }>;
}

export default async function ItemsPage({ params }: ItemsPageProps) {
  const { type } = await params;

  const itemTypeDef = ITEM_TYPES.find((t) => t.key === type);
  if (!itemTypeDef) notFound();

  const session = await auth();
  const email = session?.user?.email ?? DEMO_USER_EMAIL;
  const user = await prisma.user.findUnique({ where: { email } });

  const items = user ? await getItemsByType(user.id, type as ItemTypeKey) : [];

  const icon = itemTypeDef.icon;
  const color = itemTypeDef.color;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div
          className="size-9 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}1a` }}
        >
          {createElement(icon, { className: 'size-4.5', style: { color } })}
        </div>
        <div>
          <h1 className="text-2xl font-semibold">{itemTypeDef.label}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div
            className="size-14 rounded-xl flex items-center justify-center mb-4"
            style={{ backgroundColor: `${color}1a` }}
          >
          {createElement(icon, { className: 'size-6', style: { color } })}
          </div>
          <p className="text-sm font-medium text-foreground">No {itemTypeDef.label.toLowerCase()} yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Add your first {itemTypeDef.label.toLowerCase().replace(/s$/, '')} to get started
          </p>
        </div>
      ) : (
        <ItemsWithDrawer items={items} />
      )}
    </div>
  );
}
