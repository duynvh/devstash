import { createElement } from 'react';
import { Star, Pin } from 'lucide-react';
import { ITEM_TYPES, getItemTypeIcon } from '@/lib/constants/item-types';
import type { ItemWithType } from '@/lib/db/items';

interface ItemCardProps {
  item: ItemWithType;
  onClick?: () => void;
}

export default function ItemCard({ item, onClick }: ItemCardProps) {
  const icon = getItemTypeIcon(item.itemType.name) ?? ITEM_TYPES[0].icon;
  const color = item.itemType.color;

  return (
    <div
      className="bg-card border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors cursor-pointer border-l-[3px]"
      style={{ borderLeftColor: color }}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="size-6 rounded flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${color}1a` }}
          >
            {createElement(icon, { className: 'size-3', style: { color } })}
          </div>
          <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {item.isPinned && <Pin className="size-3 text-muted-foreground" />}
          {item.isFavorite && <Star className="size-3 fill-yellow-400 text-yellow-400" />}
        </div>
      </div>

      {item.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{item.description}</p>
      )}

      <div className="flex items-center justify-between gap-2 mt-auto">
        {item.tags.length > 0 ? (
          <div className="flex items-center gap-1 flex-wrap">
            {item.tags.slice(0, 3).map((tag) => (
              <span
                key={tag.name}
                className="text-[10px] px-1.5 py-0.5 rounded-sm bg-muted text-muted-foreground"
              >
                {tag.name}
              </span>
            ))}
          </div>
        ) : (
          <span />
        )}
        <span className="text-[10px] text-muted-foreground shrink-0">
          {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </div>
    </div>
  );
}
