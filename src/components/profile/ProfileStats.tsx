import { Layers, FolderOpen } from 'lucide-react';
import { getItemTypeIcon } from '@/lib/constants/item-types';
import type { ProfileStats } from '@/lib/db/profile';

interface ProfileStatsProps {
  stats: ProfileStats;
}

export default function ProfileStatsSection({ stats }: ProfileStatsProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-5">
      <h3 className="text-sm font-medium text-foreground">Usage Stats</h3>

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Total Items"
          value={stats.totalItems}
          icon={<Layers className="size-4" style={{ color: '#3b82f6' }} />}
          bg="#3b82f61a"
        />
        <StatCard
          label="Collections"
          value={stats.totalCollections}
          icon={<FolderOpen className="size-4" style={{ color: '#8b5cf6' }} />}
          bg="#8b5cf61a"
        />
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-3">Items by type</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {stats.itemsByType.map((t) => {
            const Icon = getItemTypeIcon(t.name);
            return (
              <div
                key={t.name}
                className="flex items-center gap-2 rounded-lg border border-border px-3 py-2"
              >
                {Icon ? (
                  <Icon className="size-3.5 shrink-0" style={{ color: t.color }} />
                ) : (
                  <span
                    className="size-3.5 rounded-full shrink-0"
                    style={{ backgroundColor: t.color }}
                  />
                )}
                <span className="text-sm text-foreground flex-1 truncate">{t.name}</span>
                <span className="text-xs text-muted-foreground tabular-nums">{t.count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  bg,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  bg: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border p-3">
      <div
        className="size-9 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: bg }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xl font-semibold text-foreground leading-none">{value}</p>
        <p className="text-xs text-muted-foreground mt-1 truncate">{label}</p>
      </div>
    </div>
  );
}
