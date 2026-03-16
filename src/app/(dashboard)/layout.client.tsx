'use client';

import TopBar from '@/components/layout/TopBar';
import Sidebar from '@/components/layout/Sidebar';
import SidebarDrawer from '@/components/layout/SidebarDrawer';
import { SidebarProvider, useSidebarContext } from '@/components/layout/SidebarProvider';
import type { SidebarCollection } from '@/lib/db/collections';

interface ClientShellProps {
  children: React.ReactNode;
  itemTypeCounts: Record<string, number>;
  sidebarCollections: { favorites: SidebarCollection[]; recents: SidebarCollection[] };
}

function DashboardShell({ children, itemTypeCounts, sidebarCollections }: ClientShellProps) {
  const { isOpen, toggle, isMobileOpen, toggleMobile, closeMobile } = useSidebarContext();

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      <TopBar onMenuClick={toggleMobile} onCollapseClick={toggle} />
      <div className="flex flex-1 overflow-hidden">
        <div className="hidden lg:flex shrink-0">
          <Sidebar
            isCollapsed={!isOpen}
            itemTypeCounts={itemTypeCounts}
            sidebarCollections={sidebarCollections}
          />
        </div>
        <SidebarDrawer
          isOpen={isMobileOpen}
          onClose={closeMobile}
          itemTypeCounts={itemTypeCounts}
          sidebarCollections={sidebarCollections}
        />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

export function ClientShell({ children, itemTypeCounts, sidebarCollections }: ClientShellProps) {
  return (
    <SidebarProvider>
      <DashboardShell
        itemTypeCounts={itemTypeCounts}
        sidebarCollections={sidebarCollections}
      >
        {children}
      </DashboardShell>
    </SidebarProvider>
  );
}
