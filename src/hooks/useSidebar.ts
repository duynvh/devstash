'use client';

import { useState, useCallback } from 'react';

export function useSidebar(defaultOpen = true) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggle = useCallback(() => setIsOpen((v) => !v), []);
  const toggleMobile = useCallback(() => setIsMobileOpen((v) => !v), []);
  const closeMobile = useCallback(() => setIsMobileOpen(false), []);

  return { isOpen, toggle, isMobileOpen, toggleMobile, closeMobile };
}
