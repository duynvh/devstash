import UserAvatar from '@/components/ui/UserAvatar';
import { Calendar } from 'lucide-react';
import type { ProfileUser } from '@/lib/db/profile';

interface ProfileHeaderProps {
  user: ProfileUser;
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  const displayName = user.name || user.email.split('@')[0];
  const joined = user.createdAt.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-4">
        <UserAvatar
          name={displayName}
          image={user.image}
          size="md"
          className="!size-16 !text-xl"
        />
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-foreground truncate">
            {displayName}
          </h2>
          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
            <Calendar className="size-3" />
            <span>Joined {joined}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
