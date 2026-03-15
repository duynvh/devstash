import Link from 'next/link';
import { Star, FolderOpen } from 'lucide-react';

interface Collection {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  itemCount: number;
}

interface RecentCollectionsProps {
  collections: Collection[];
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
            className="group block rounded-lg border border-border bg-card p-4 hover:border-border/80 hover:bg-muted/30 transition-all"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <FolderOpen className="size-4 text-muted-foreground shrink-0" />
                <span className="font-medium text-sm text-foreground truncate">{col.name}</span>
              </div>
              {col.isFavorite && (
                <Star className="size-3.5 fill-yellow-400 text-yellow-400 shrink-0 mt-0.5" />
              )}
            </div>
            {col.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{col.description}</p>
            )}
            <p className="text-xs text-muted-foreground">{col.itemCount} items</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
