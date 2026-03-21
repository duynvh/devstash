'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import UserAvatar from '@/components/ui/UserAvatar';

interface SidebarUserProps {
  name: string;
  email: string;
  image?: string | null;
  isCollapsed: boolean;
}

export default function SidebarUser({ name, email, image, isCollapsed }: SidebarUserProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2.5 w-full px-2 py-1.5 rounded-md hover:bg-sidebar-accent/60 cursor-pointer transition-colors"
        title={isCollapsed ? name : undefined}
      >
        <UserAvatar name={name} image={image} size="sm" />
        {!isCollapsed && (
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{name}</p>
            <p className="text-xs text-muted-foreground truncate">{email}</p>
          </div>
        )}
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-1 w-48 rounded-lg border border-border bg-popover shadow-lg py-1 z-50">
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-popover-foreground hover:bg-accent transition-colors"
          >
            Profile
          </Link>
          <div className="my-1 border-t border-border" />
          <button
            onClick={() => signOut({ callbackUrl: '/sign-in' })}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-accent transition-colors"
          >
            <LogOut className="size-3.5" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
