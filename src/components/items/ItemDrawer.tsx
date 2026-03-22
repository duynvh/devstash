'use client';

import { useEffect, useState, createElement } from 'react';
import { Star, Pin, Copy, Pencil, Trash2, X, Calendar, Tag, FolderOpen } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { ITEM_TYPES, getItemTypeIcon } from '@/lib/constants/item-types';
import type { ItemDetail } from '@/lib/db/items';

interface ItemDrawerProps {
  itemId: string | null;
  onClose: () => void;
}

export default function ItemDrawer({ itemId, onClose }: ItemDrawerProps) {
  const [item, setItem] = useState<ItemDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!itemId) {
      setItem(null);
      return;
    }
    setLoading(true);
    fetch(`/api/items/${itemId}`)
      .then((r) => r.json())
      .then((data: ItemDetail) => setItem(data))
      .finally(() => setLoading(false));
  }, [itemId]);

  return (
    <Sheet open={!!itemId} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col gap-0 p-0 overflow-y-auto" showCloseButton={false}>
        {loading && <DrawerSkeleton />}
        {!loading && item && <DrawerContent item={item} onClose={onClose} />}
      </SheetContent>
    </Sheet>
  );
}

function DrawerContent({ item, onClose }: { item: ItemDetail; onClose: () => void }) {
  const icon = getItemTypeIcon(item.itemType.name) ?? ITEM_TYPES[0].icon;
  const color = item.itemType.color;

  return (
    <>
      <SheetHeader className="px-5 pt-5 pb-4 border-b border-border">
        <div className="flex items-start gap-3">
          <div
            className="size-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
            style={{ backgroundColor: `${color}1a` }}
          >
            {createElement(icon, { className: 'size-4', style: { color } })}
          </div>
          <div className="flex-1 min-w-0">
            <SheetTitle className="text-base font-semibold leading-snug">{item.title}</SheetTitle>
            <p className="text-xs text-muted-foreground mt-0.5 capitalize">{item.itemType.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-1">
            <ActionButton
              label="Favorite"
              icon={<Star className={`size-4 ${item.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />}
            />
            <ActionButton label="Pin" icon={<Pin className={`size-4 ${item.isPinned ? 'text-foreground' : ''}`} />} />
            <ActionButton label="Copy" icon={<Copy className="size-4" />} />
            <ActionButton label="Edit" icon={<Pencil className="size-4" />} />
          </div>
          <ActionButton label="Delete" icon={<Trash2 className="size-4 text-destructive" />} />
        </div>
      </SheetHeader>

      <div className="px-5 py-4 space-y-5 flex-1">
        {item.description && (
          <Section label="Description">
            <p className="text-sm text-muted-foreground">{item.description}</p>
          </Section>
        )}

        {item.tags.length > 0 && (
          <Section label="Tags" icon={<Tag className="size-3" />}>
            <div className="flex flex-wrap gap-1.5">
              {item.tags.map((tag) => (
                <span
                  key={tag.name}
                  className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </Section>
        )}

        {item.collections.length > 0 && (
          <Section label="Collections" icon={<FolderOpen className="size-3" />}>
            <div className="flex flex-wrap gap-1.5">
              {item.collections.map(({ collection }) => (
                <span
                  key={collection.id}
                  className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground"
                >
                  {collection.name}
                </span>
              ))}
            </div>
          </Section>
        )}

        <Section label="Details" icon={<Calendar className="size-3" />}>
          <dl className="space-y-1.5 text-xs">
            <DetailRow label="Created" value={formatDate(item.createdAt)} />
            <DetailRow label="Updated" value={formatDate(item.updatedAt)} />
            {item.language && <DetailRow label="Language" value={item.language} />}
            {item.fileName && <DetailRow label="File" value={item.fileName} />}
            {item.fileSize != null && <DetailRow label="Size" value={formatBytes(item.fileSize)} />}
            {item.url && (
              <DetailRow
                label="URL"
                value={
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline truncate block max-w-[200px]"
                  >
                    {item.url}
                  </a>
                }
              />
            )}
          </dl>
        </Section>
      </div>
    </>
  );
}

function ActionButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button
      title={label}
      className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
    >
      {icon}
    </button>
  );
}

function Section({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {icon}
        <span>{label}</span>
      </div>
      {children}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-2">
      <dt className="text-muted-foreground w-16 shrink-0">{label}</dt>
      <dd className="text-foreground">{value}</dd>
    </div>
  );
}

function DrawerSkeleton() {
  return (
    <div className="px-5 pt-5 space-y-4">
      <div className="flex items-start gap-3">
        <Skeleton className="size-9 rounded-lg shrink-0" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="size-8 rounded-md" />
        ))}
      </div>
      <Skeleton className="h-px w-full" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-1/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  );
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
