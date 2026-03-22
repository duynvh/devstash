'use server';

import { z } from 'zod';
import { auth } from '@/auth';
import { updateItem as dbUpdateItem, deleteItem as dbDeleteItem } from '@/lib/db/items';
import type { ItemDetail } from '@/lib/db/items';

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

const UpdateItemSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().trim().nullable().optional(),
  content: z.string().nullable().optional(),
  url: z.string().url('Must be a valid URL').nullable().optional(),
  language: z.string().trim().nullable().optional(),
  tags: z.array(z.string().trim().min(1)).default([]),
});

export async function updateItem(
  itemId: string,
  raw: unknown
): Promise<ActionResult<ItemDetail>> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Not authenticated.' };

  const parsed = UpdateItemSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { title, description, content, url, language, tags } = parsed.data;

  try {
    const item = await dbUpdateItem(itemId, session.user.id, {
      title,
      description: description ?? null,
      content: content ?? null,
      url: url ?? null,
      language: language ?? null,
      tags,
    });
    return { success: true, data: item };
  } catch {
    return { success: false, error: 'Failed to update item.' };
  }
}

export async function deleteItem(itemId: string): Promise<ActionResult<null>> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Not authenticated.' };

  try {
    await dbDeleteItem(itemId, session.user.id);
    return { success: true, data: null };
  } catch {
    return { success: false, error: 'Failed to delete item.' };
  }
}
