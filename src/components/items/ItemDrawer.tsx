'use client';

import { useEffect, useState, createElement } from 'react';
import { useRouter } from 'next/navigation';
import { Star, Pin, Copy, Pencil, Trash2, X, Calendar, Tag, FolderOpen } from 'lucide-react';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ITEM_TYPES, getItemTypeIcon } from '@/lib/constants/item-types';
import { deleteItem } from '@/actions/items';
import ItemDrawerEditForm from './ItemDrawerEditForm';
import CodeEditor from './CodeEditor';
import type { ItemDetail } from '@/lib/db/items';

const CODE_EDITOR_TYPES = ['snippet', 'command'];

interface ItemDrawerProps {
  itemId: string | null;
  onClose: () => void;
}

export default function ItemDrawer({ itemId, onClose }: ItemDrawerProps) {
  const [item, setItem] = useState<ItemDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!itemId) return;
    let active = true;
    async function load() {
      setLoading(true);
      setItem(null);
      try {
        const r = await fetch(`/api/items/${itemId}`);
        const data: ItemDetail = await r.json();
        if (active) setItem(data);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [itemId]);

  return (
    <Sheet open={!!itemId} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col gap-0 p-0 overflow-y-auto" showCloseButton={false}>
        {loading && <DrawerSkeleton />}
        {!loading && item && <DrawerContent item={item} onClose={onClose} onItemUpdate={setItem} />}
      </SheetContent>
    </Sheet>
  );
}

function DrawerContent({
  item,
  onClose,
  onItemUpdate,
}: {
  item: ItemDetail;
  onClose: () => void;
  onItemUpdate: (item: ItemDetail) => void;
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const icon = getItemTypeIcon(item.itemType.name) ?? ITEM_TYPES[0].icon;
  const color = item.itemType.color;

  async function handleDelete() {
    setIsDeleting(true);
    const result = await deleteItem(item.id);
    setIsDeleting(false);
    if (result.success) {
      toast.success('Item deleted');
      onClose();
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

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
          {isEditing ? (
            <p className="text-xs text-muted-foreground italic">Editing…</p>
          ) : (
            <>
              <div className="flex items-center gap-1">
                <ActionButton
                  label="Favorite"
                  icon={<Star className={`size-4 ${item.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />}
                />
                <ActionButton label="Pin" icon={<Pin className={`size-4 ${item.isPinned ? 'text-foreground' : ''}`} />} />
                <ActionButton label="Copy" icon={<Copy className="size-4" />} />
                <ActionButton
                  label="Edit"
                  icon={<Pencil className="size-4" />}
                  onClick={() => setIsEditing(true)}
                />
              </div>
              <ActionButton
                label="Delete"
                icon={<Trash2 className="size-4 text-destructive" />}
                onClick={() => setShowDeleteDialog(true)}
              />
            </>
          )}
        </div>
      </SheetHeader>

      {isEditing ? (
        <ItemDrawerEditForm
          item={item}
          onCancel={() => setIsEditing(false)}
          onSaved={(updated) => {
            onItemUpdate(updated);
            setIsEditing(false);
          }}
        />
      ) : (
        <ViewContent item={item} />
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete item?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-foreground">&ldquo;{item.title}&rdquo;</span> will be permanently deleted.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function ViewContent({ item }: { item: ItemDetail }) {
  const typeName = item.itemType.name.toLowerCase();
  const isCodeType = CODE_EDITOR_TYPES.includes(typeName);

  return (
    <div className="px-5 py-4 space-y-5 flex-1">
      {item.description && (
        <Section label="Description">
          <p className="text-sm text-muted-foreground">{item.description}</p>
        </Section>
      )}

      {item.content && isCodeType && (
        <Section label="Content">
          <CodeEditor
            value={item.content}
            language={item.language ?? 'plaintext'}
            readonly
          />
        </Section>
      )}

      {item.content && !isCodeType && (
        <Section label="Content">
          <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans">{item.content}</pre>
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
  );
}

function ActionButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      title={label}
      onClick={onClick}
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
