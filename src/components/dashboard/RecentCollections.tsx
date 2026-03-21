import Link from 'next/link';
import { Star } from 'lucide-react';
import { getItemTypeIcon } from '@/lib/constants/item-types';
import type { CollectionWithTypes } from '@/lib/db/collections';

interface RecentCollectionsProps {
  collections: CollectionWithTypes[];
}

export default function RecentCollections({ collections }: RecentCollectionsProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-foreground">Recent Collections</h2>
        <Link
          href="/collections"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          View all
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {collections.map((col) => (
          <Link
            key={col.id}
            href={`/collections/${col.id}`}
            className="group block rounded-lg border bg-card p-4 hover:bg-muted/30 transition-all"
            style={{ borderColor: `${col.dominantColor}55` }}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="font-medium text-sm text-foreground truncate">{col.name}</span>
              {col.isFavorite && (
                <Star className="size-3.5 fill-yellow-400 text-yellow-400 shrink-0 mt-0.5" />
              )}
            </div>
            {col.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{col.description}</p>
            )}
            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center gap-1">
                {col.types.slice(0, 4).map((t) => {
                  const Icon = getItemTypeIcon(t.name);
                  if (!Icon) return null;
                  return (
                    <div
                      key={t.name}
                      className="size-5 rounded flex items-center justify-center"
                      style={{ backgroundColor: `${t.color}22` }}
                      title={t.name}
                    >
                      <Icon className="size-3" style={{ color: t.color }} />
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">{col.itemCount} items</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
