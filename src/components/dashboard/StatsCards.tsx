import { Layers, FolderOpen, Star, BookMarked } from 'lucide-react';

interface StatsCardsProps {
  totalItems: number;
  totalCollections: number;
  favoriteItems: number;
  favoriteCollections: number;
}

const stats = (props: StatsCardsProps) => [
  {
    label: 'Total Items',
    value: props.totalItems,
    icon: Layers,
    color: '#3b82f6',
  },
  {
    label: 'Collections',
    value: props.totalCollections,
    icon: FolderOpen,
    color: '#8b5cf6',
  },
  {
    label: 'Favorite Items',
    value: props.favoriteItems,
    icon: Star,
    color: '#f97316',
  },
  {
    label: 'Favorite Collections',
    value: props.favoriteCollections,
    icon: BookMarked,
    color: '#10b981',
  },
];

export default function StatsCards(props: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats(props).map(({ label, value, icon: Icon, color }) => (
        <div
          key={label}
          className="rounded-lg border border-border bg-card p-4 flex items-center gap-3"
        >
          <div
            className="size-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${color}1a` }}
          >
            <Icon className="size-4" style={{ color }} />
          </div>
          <div className="min-w-0">
            <p className="text-xl font-semibold text-foreground leading-none">{value}</p>
            <p className="text-xs text-muted-foreground mt-1 truncate">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
