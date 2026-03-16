'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Star, FolderOpen, ChevronDown, ChevronRight, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ITEM_TYPES } from '@/lib/constants/item-types';
import { mockUser } from '@/lib/mock-data';
import { useState } from 'react';
import type { SidebarCollection } from '@/lib/db/collections';

interface SidebarProps {
  isCollapsed: boolean;
  onClose?: () => void;
  itemTypeCounts: Record<string, number>;
  sidebarCollections: { favorites: SidebarCollection[]; recents: SidebarCollection[] };
}

export default function Sidebar({ isCollapsed, onClose, itemTypeCounts, sidebarCollections }: SidebarProps) {
  const pathname = usePathname();
  const [typesOpen, setTypesOpen] = useState(true);
  const [collectionsOpen, setCollectionsOpen] = useState(true);

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-200 overflow-hidden',
        isCollapsed ? 'w-14' : 'w-60'
      )}
    >
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        <SectionHeader
          label="Types"
          isCollapsed={isCollapsed}
          isOpen={typesOpen}
          onToggle={() => setTypesOpen((v) => !v)}
        />

        {(!isCollapsed && typesOpen) || isCollapsed ? (
          <nav className="space-y-0.5">
            {ITEM_TYPES.map((type) => {
              const Icon = type.icon;
              const href = `/items/${type.key}`;
              const typeName = type.key.replace(/s$/, '');
              const count = itemTypeCounts[typeName] ?? 0;
              const active = pathname === href;

              return (
                <Link
                  key={type.key}
                  href={href}
                  onClick={onClose}
                  title={isCollapsed ? type.label : undefined}
                  className={cn(
                    'flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-colors group',
                    active
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
                  )}
                >
                  <Icon
                    className="size-4 shrink-0"
                    style={{ color: type.color }}
                  />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 truncate">{type.label}</span>
                      <span className="text-xs text-muted-foreground tabular-nums">{count}</span>
                    </>
                  )}
                </Link>
              );
            })}
          </nav>
        ) : null}

        {!isCollapsed && (
          <>
            <div className="pt-2">
              <SectionHeader
                label="Collections"
                isCollapsed={false}
                isOpen={collectionsOpen}
                onToggle={() => setCollectionsOpen((v) => !v)}
              />
            </div>

            {collectionsOpen && (
              <div className="space-y-3 pt-1">
                <CollectionGroup
                  label="Favorites"
                  collections={sidebarCollections.favorites}
                  showStar
                  onClose={onClose}
                />
                <CollectionGroup
                  label="Recent"
                  collections={sidebarCollections.recents}
                  onClose={onClose}
                />
                <Link
                  href="/collections"
                  onClick={onClose}
                  className="block px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  View all collections →
                </Link>
              </div>
            )}
          </>
        )}
      </div>

      <div className={cn(
        'border-t border-sidebar-border p-2 shrink-0',
        isCollapsed ? 'flex justify-center' : ''
      )}>
        <div className={cn(
          'flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-sidebar-accent/60 cursor-pointer transition-colors',
          isCollapsed && 'justify-center px-1'
        )}>
          <div className="size-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold shrink-0">
            {mockUser.name.charAt(0)}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{mockUser.name}</p>
              <p className="text-xs text-muted-foreground truncate">{mockUser.email}</p>
            </div>
          )}
          {!isCollapsed && <Settings className="size-3.5 text-muted-foreground shrink-0" />}
        </div>
      </div>
    </aside>
  );
}

function SectionHeader({
  label,
  isCollapsed,
  isOpen,
  onToggle,
}: {
  label: string;
  isCollapsed: boolean;
  isOpen: boolean;
  onToggle: () => void;
}) {
  if (isCollapsed) return null;
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-1 w-full px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
    >
      {isOpen ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
      {label}
    </button>
  );
}

function CollectionGroup({
  label,
  collections,
  showStar,
  onClose,
}: {
  label: string;
  collections: SidebarCollection[];
  showStar?: boolean;
  onClose?: () => void;
}) {
  if (collections.length === 0) return null;
  return (
    <div>
      <p className="px-2 mb-1 text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium">
        {label}
      </p>
      <div className="space-y-0.5">
        {collections.map((col) => (
          <Link
            key={col.id}
            href={`/collections/${col.id}`}
            onClick={onClose}
            className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground transition-colors group"
          >
            {showStar ? (
              <FolderOpen className="size-3.5 shrink-0 text-muted-foreground" />
            ) : (
              <span
                className="size-3 rounded-full shrink-0"
                style={{ backgroundColor: col.dominantColor }}
              />
            )}
            <span className="flex-1 truncate">{col.name}</span>
            {showStar && <Star className="size-3 fill-yellow-400 text-yellow-400 shrink-0" />}
            {!showStar && (
              <span className="text-xs text-muted-foreground tabular-nums">{col.itemCount}</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
