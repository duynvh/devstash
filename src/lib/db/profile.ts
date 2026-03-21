import { prisma } from '@/lib/prisma';

export interface ProfileUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  createdAt: Date;
  hasPassword: boolean;
}

export interface ProfileStats {
  totalItems: number;
  totalCollections: number;
  itemsByType: { name: string; icon: string; color: string; count: number }[];
}

export async function getProfileUser(userId: string): Promise<ProfileUser | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      createdAt: true,
      password: true,
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    createdAt: user.createdAt,
    hasPassword: !!user.password,
  };
}

export async function getProfileStats(userId: string): Promise<ProfileStats> {
  const [totalItems, totalCollections, groups, allTypes] = await Promise.all([
    prisma.item.count({ where: { userId } }),
    prisma.collection.count({ where: { userId } }),
    prisma.item.groupBy({
      by: ['itemTypeId'],
      where: { userId },
      _count: { _all: true },
    }),
    prisma.itemType.findMany({
      where: { OR: [{ isSystem: true }, { userId }] },
      select: { id: true, name: true, icon: true, color: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  const countById = new Map(groups.map((g) => [g.itemTypeId, g._count._all]));

  const itemsByType = allTypes.map((t) => ({
    name: t.name,
    icon: t.icon,
    color: t.color,
    count: countById.get(t.id) ?? 0,
  }));

  return { totalItems, totalCollections, itemsByType };
}
