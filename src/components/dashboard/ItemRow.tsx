import { createElement } from 'react';
import { Star, Pin } from 'lucide-react';
import { ITEM_TYPES, getItemTypeIcon } from '@/lib/constants/item-types';
import type { ItemWithType } from '@/lib/db/items';

interface ItemRowProps {
  item: ItemWithType;
}

export default function ItemRow({ item }: ItemRowProps) {
  const icon = getItemTypeIcon(item.itemType.name) ?? ITEM_TYPES[0].icon;
  const color = item.itemType.color;

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-card hover:bg-muted/30 transition-colors cursor-pointer">
      <div
        className="size-7 rounded flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${color}1a` }}
      >
        {createElement(icon, { className: 'size-3.5', style: { color } })}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
        {item.description && (
          <p className="text-xs text-muted-foreground truncate">{item.description}</p>
        )}
        {item.tags.length > 0 && (
          <div className="flex items-center gap-1 mt-1 flex-wrap">
            {item.tags.slice(0, 3).map((tag) => (
              <span
                key={tag.name}
                className="text-[10px] px-1.5 py-0.5 rounded-sm bg-muted text-muted-foreground"
              >
                {tag.name}
              </span>
            ))}
          </div>
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
