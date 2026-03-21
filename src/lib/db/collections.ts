import { prisma } from '@/lib/prisma';

export interface CollectionTypeInfo {
  name: string;
  icon: string;
  color: string;
  count: number;
}

export interface CollectionWithTypes {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  itemCount: number;
  dominantColor: string;
  types: CollectionTypeInfo[];
}

export interface SidebarCollection {
  id: string;
  name: string;
  isFavorite: boolean;
  itemCount: number;
  dominantColor: string;
}

export async function getRecentCollections(userId: string, limit = 6): Promise<CollectionWithTypes[]> {
  const collections = await prisma.collection.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    take: limit,
    include: {
      _count: { select: { items: true } },
      items: {
        take: 20,
        include: {
          item: {
            select: { itemType: { select: { id: true, name: true, icon: true, color: true } } },
          },
        },
      },
    },
  });

  return collections.map((col) => {
    const typeCounts = new Map<string, CollectionTypeInfo>();

    for (const ic of col.items) {
      const t = ic.item.itemType;
      const existing = typeCounts.get(t.id);
      if (existing) {
        existing.count++;
      } else {
        typeCounts.set(t.id, { name: t.name, icon: t.icon, color: t.color, count: 1 });
      }
    }

    const types = Array.from(typeCounts.values()).sort((a, b) => b.count - a.count);
    const dominantColor = types[0]?.color ?? '#6b7280';

    return {
      id: col.id,
      name: col.name,
      description: col.description,
      isFavorite: col.isFavorite,
      itemCount: col._count.items,
      dominantColor,
      types,
    };
  });
}

export async function getCollectionStats(userId: string) {
  const [totalCollections, favoriteCollections] = await Promise.all([
    prisma.collection.count({ where: { userId } }),
    prisma.collection.count({ where: { userId, isFavorite: true } }),
  ]);
  return { totalCollections, favoriteCollections };
}

export async function getSidebarCollections(userId: string): Promise<{
  favorites: SidebarCollection[];
  recents: SidebarCollection[];
}> {
  const collections = await prisma.collection.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    take: 20,
    include: {
      _count: { select: { items: true } },
      items: {
        take: 10,
        include: {
          item: { select: { itemType: { select: { id: true, color: true } } } },
        },
      },
    },
  });

  const mapped: SidebarCollection[] = collections.map((col) => {
    const typeCounts = new Map<string, { color: string; count: number }>();
    for (const ic of col.items) {
      const t = ic.item.itemType;
      const existing = typeCounts.get(t.id);
      if (existing) existing.count++;
      else typeCounts.set(t.id, { color: t.color, count: 1 });
    }
    const sorted = Array.from(typeCounts.values()).sort((a, b) => b.count - a.count);
    return {
      id: col.id,
      name: col.name,
      isFavorite: col.isFavorite,
      itemCount: col._count.items,
      dominantColor: sorted[0]?.color ?? '#6b7280',
    };
  });

  return {
    favorites: mapped.filter((c) => c.isFavorite),
    recents: mapped.filter((c) => !c.isFavorite).slice(0, 5),
  };
}
