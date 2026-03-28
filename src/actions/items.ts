'use server';

import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import {
  updateItem as dbUpdateItem,
  deleteItem as dbDeleteItem,
  createItem as dbCreateItem,
} from '@/lib/db/items';
import type { ItemDetail } from '@/lib/db/items';

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

const CREATABLE_TYPES = ['snippet', 'prompt', 'command', 'note', 'link'] as const;

const CreateItemSchema = z
  .object({
    typeName: z.enum(CREATABLE_TYPES),
    title: z.string().trim().min(1, 'Title is required'),
    description: z.string().trim().optional(),
    content: z.string().optional(),
    url: z.string().optional(),
    language: z.string().trim().optional(),
    tags: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.typeName === 'link' && !val.url?.trim()) {
      ctx.addIssue({ code: 'custom', path: ['url'], message: 'URL is required for links' });
    }
    if (val.typeName === 'link' && val.url?.trim()) {
      const result = z.string().url('Must be a valid URL').safeParse(val.url.trim());
      if (!result.success) {
        ctx.addIssue({ code: 'custom', path: ['url'], message: result.error.issues[0].message });
      }
    }
  });

export async function createItem(raw: unknown): Promise<ActionResult<ItemDetail>> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Not authenticated.' };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true },
  });
  if (!user) return { success: false, error: 'Session expired. Please sign in again.' };

  const parsed = CreateItemSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { typeName, title, description, content, url, language, tags } = parsed.data;
  const tagList = tags
    ? tags.split(',').map((t) => t.trim()).filter(Boolean)
    : [];

  try {
    const item = await dbCreateItem(user.id, {
      typeName,
      title,
      description: description || null,
      content: content || null,
      url: url || null,
      language: language || null,
      tags: tagList,
    });
    return { success: true, data: item };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[createItem]', msg);
    return { success: false, error: 'Failed to create item.' };
  }
}

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
