import { cn } from '@/lib/utils';

interface UserAvatarProps {
  name: string;
  image?: string | null;
  size?: 'sm' | 'md';
  className?: string;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

export default function UserAvatar({ name, image, size = 'md', className }: UserAvatarProps) {
  const sizeClass = size === 'sm' ? 'size-7 text-xs' : 'size-8 text-sm';

  if (image) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={image}
        alt={name}
        className={cn('rounded-full object-cover shrink-0', sizeClass, className)}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold shrink-0',
        sizeClass,
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
}
