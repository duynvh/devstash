'use client';

import Sidebar from './Sidebar';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SidebarDrawer({ isOpen, onClose }: SidebarDrawerProps) {
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
        <Sidebar isCollapsed={false} onClose={onClose} />
      </div>
    </>
  );
}
