import { Star, Pin } from 'lucide-react';
import { ITEM_TYPES } from '@/lib/constants/item-types';
import { mockItemTypes } from '@/lib/mock-data';
import type { ElementType } from 'react';

interface Item {
  id: string;
  title: string;
  description: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  itemTypeId: string;
  createdAt: Date;
}

interface ItemRowProps {
  item: Item;
}

function getItemType(itemTypeId: string): { icon: ElementType; color: string } {
  const mockType = mockItemTypes.find((t) => t.id === itemTypeId);
  const matched = ITEM_TYPES.find((t) => t.key === (mockType?.name ?? '') + 's');
  return matched ?? { icon: ITEM_TYPES[0].icon, color: ITEM_TYPES[0].color };
}

export default function ItemRow({ item }: ItemRowProps) {
  const { icon: Icon, color } = getItemType(item.itemTypeId);
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-card hover:bg-muted/30 transition-colors cursor-pointer">
      <div
        className="size-7 rounded flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${color}1a` }}
      >
        <Icon className="size-3.5" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
        {item.description && (
          <p className="text-xs text-muted-foreground truncate">{item.description}</p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {item.isPinned && <Pin className="size-3 text-muted-foreground" />}
        {item.isFavorite && <Star className="size-3 fill-yellow-400 text-yellow-400" />}
        <span className="text-xs text-muted-foreground hidden sm:block">
          {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </div>
    </div>
  );
}
