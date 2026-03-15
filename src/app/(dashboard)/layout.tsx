'use client';

import TopBar from '@/components/layout/TopBar';
import Sidebar from '@/components/layout/Sidebar';
import SidebarDrawer from '@/components/layout/SidebarDrawer';
import { SidebarProvider, useSidebarContext } from '@/components/layout/SidebarProvider';

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { isOpen, toggle, isMobileOpen, toggleMobile, closeMobile } = useSidebarContext();

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      <TopBar onMenuClick={toggleMobile} onCollapseClick={toggle} />
      <div className="flex flex-1 overflow-hidden">
        <div className="hidden lg:flex shrink-0">
          <Sidebar isCollapsed={!isOpen} />
        </div>
        <SidebarDrawer isOpen={isMobileOpen} onClose={closeMobile} />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <DashboardShell>{children}</DashboardShell>
    </SidebarProvider>
  );
}
