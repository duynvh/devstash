import { prisma } from '@/lib/prisma';

export interface ItemDetail {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  url: string | null;
  language: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  itemType: { name: string; icon: string; color: string };
  tags: { name: string }[];
  collections: { collection: { id: string; name: string } }[];
}

export async function getItemById(id: string, userId: string): Promise<ItemDetail | null> {
  return prisma.item.findFirst({
    where: { id, userId },
    include: {
      itemType: { select: { name: true, icon: true, color: true } },
      tags: { select: { name: true } },
      collections: { select: { collection: { select: { id: true, name: true } } } },
    },
  });
}

export interface ItemWithType {
  id: string;
  title: string;
  description: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  createdAt: Date;
  itemType: {
    name: string;
    icon: string;
    color: string;
  };
  tags: { name: string }[];
}

export async function getPinnedItems(userId: string, limit = 10): Promise<ItemWithType[]> {
  return prisma.item.findMany({
    where: { userId, isPinned: true },
    orderBy: { updatedAt: 'desc' },
    take: limit,
    include: {
      itemType: { select: { name: true, icon: true, color: true } },
      tags: { select: { name: true } },
    },
  });
}

export async function getRecentItems(userId: string, limit = 10): Promise<ItemWithType[]> {
  return prisma.item.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    take: limit,
    include: {
      itemType: { select: { name: true, icon: true, color: true } },
      tags: { select: { name: true } },
    },
  });
}

export async function getItemTypeCounts(userId: string): Promise<Record<string, number>> {
  const groups = await prisma.item.groupBy({
    by: ['itemTypeId'],
    where: { userId },
    _count: { _all: true },
  });

  const typeIds = groups.map((g) => g.itemTypeId);
  const types = await prisma.itemType.findMany({
    where: { id: { in: typeIds } },
    select: { id: true, name: true },
  });

  const nameById = Object.fromEntries(types.map((t) => [t.id, t.name]));
  return Object.fromEntries(groups.map((g) => [nameById[g.itemTypeId], g._count._all]));
}

export async function getItemsByType(userId: string, typeKey: string): Promise<ItemWithType[]> {
  const singular = typeKey.replace(/s$/, '');
  return prisma.item.findMany({
    where: {
      userId,
      itemType: { name: { equals: singular, mode: 'insensitive' } },
    },
    orderBy: { updatedAt: 'desc' },
    include: {
      itemType: { select: { name: true, icon: true, color: true } },
      tags: { select: { name: true } },
    },
  });
}
