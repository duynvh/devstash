'use client';

import { Search, Plus, FolderPlus, PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TopBarProps {
  onMenuClick: () => void;
  onCollapseClick: () => void;
}

export default function TopBar({ onMenuClick, onCollapseClick }: TopBarProps) {
  return (
    <header className="flex items-center h-14 px-4 border-b border-border shrink-0 gap-3">
      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden size-8"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <PanelLeft className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="hidden lg:flex size-8"
          onClick={onCollapseClick}
          aria-label="Toggle sidebar"
        >
          <PanelLeft className="size-4" />
        </Button>
        <div className="size-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
          D
        </div>
        <span className="font-semibold text-foreground">DevStash</span>
      </div>

      <div className="hidden md:flex flex-1 justify-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
          <Input
            placeholder="Search items..."
            className="pl-9 pr-12 bg-muted/50 border-border text-sm"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            ⌘K
          </span>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon" className="md:hidden">
          <Search className="size-4" />
        </Button>
        <Button variant="outline" size="sm" className="gap-2 hidden sm:flex">
          <FolderPlus className="size-4" />
          <span className="hidden lg:inline">New Collection</span>
        </Button>
        <Button size="sm" className="gap-1">
          <Plus className="size-4" />
          <span className="hidden sm:inline">New Item</span>
        </Button>
      </div>
    </header>
  );
}
