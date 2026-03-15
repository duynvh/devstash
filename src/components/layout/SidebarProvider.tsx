'use client';

import { createContext, useContext } from 'react';
import { useSidebar } from '@/hooks/useSidebar';

type SidebarContextValue = ReturnType<typeof useSidebar>;

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const sidebar = useSidebar(true);
  return <SidebarContext.Provider value={sidebar}>{children}</SidebarContext.Provider>;
}

export function useSidebarContext() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebarContext must be used within SidebarProvider');
  return ctx;
}
