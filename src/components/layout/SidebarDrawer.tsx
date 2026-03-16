'use client';

import Sidebar from './Sidebar';
import type { SidebarCollection } from '@/lib/db/collections';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  itemTypeCounts: Record<string, number>;
  sidebarCollections: { favorites: SidebarCollection[]; recents: SidebarCollection[] };
}

export default function SidebarDrawer({ isOpen, onClose, itemTypeCounts, sidebarCollections }: SidebarDrawerProps) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <div
        className={`fixed inset-y-0 left-0 z-50 lg:hidden transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar
          isCollapsed={false}
          onClose={onClose}
          itemTypeCounts={itemTypeCounts}
          sidebarCollections={sidebarCollections}
        />
      </div>
    </>
  );
}
