import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/db/items', () => ({
  updateItem: vi.fn(),
  deleteItem: vi.fn(),
}));

import { updateItem, deleteItem } from './items';
import { auth } from '@/auth';
import { updateItem as dbUpdateItem, deleteItem as dbDeleteItem } from '@/lib/db/items';

const mockAuth = auth as ReturnType<typeof vi.fn>;
const mockDbUpdate = dbUpdateItem as ReturnType<typeof vi.fn>;
const mockDbDelete = dbDeleteItem as ReturnType<typeof vi.fn>;

const fakeItem = {
  id: 'item-1',
  title: 'Updated Title',
  description: null,
  content: 'some content',
  fileUrl: null,
  fileName: null,
  fileSize: null,
  url: null,
  language: 'typescript',
  isFavorite: false,
  isPinned: false,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-02'),
  itemType: { name: 'snippet', icon: 'Code', color: '#3b82f6' },
  tags: [{ name: 'ts' }],
  collections: [],
};

describe('updateItem action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns error when not authenticated', async () => {
    mockAuth.mockResolvedValue(null);

    const result = await updateItem('item-1', { title: 'Hello', tags: [] });

    expect(result).toEqual({ success: false, error: 'Not authenticated.' });
    expect(mockDbUpdate).not.toHaveBeenCalled();
  });

  it('returns error when title is empty', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } });

    const result = await updateItem('item-1', { title: '  ', tags: [] });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe('Title is required');
    expect(mockDbUpdate).not.toHaveBeenCalled();
  });

  it('returns error when title is missing', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } });

    const result = await updateItem('item-1', { tags: [] });

    expect(result.success).toBe(false);
  });

  it('returns error when URL is invalid', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } });

    const result = await updateItem('item-1', {
      title: 'My Link',
      url: 'not-a-url',
      tags: [],
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe('Must be a valid URL');
    expect(mockDbUpdate).not.toHaveBeenCalled();
  });

  it('returns error when DB throws', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } });
    mockDbUpdate.mockRejectedValue(new Error('DB error'));

    const result = await updateItem('item-1', { title: 'Hello', tags: [] });

    expect(result).toEqual({ success: false, error: 'Failed to update item.' });
  });

  it('returns updated item on success', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } });
    mockDbUpdate.mockResolvedValue(fakeItem);

    const result = await updateItem('item-1', {
      title: 'Updated Title',
      description: null,
      content: 'some content',
      language: 'typescript',
      tags: ['ts'],
    });

    expect(result).toEqual({ success: true, data: fakeItem });
  });

  it('calls dbUpdateItem with correct args including tag cleanup', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } });
    mockDbUpdate.mockResolvedValue(fakeItem);

    await updateItem('item-1', {
      title: 'Test',
      tags: ['react', ' next '],
    });

    expect(mockDbUpdate).toHaveBeenCalledWith('item-1', 'user-1', {
      title: 'Test',
      description: null,
      content: null,
      url: null,
      language: null,
      tags: ['react', 'next'],
    });
  });

  it('accepts a valid URL', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } });
    mockDbUpdate.mockResolvedValue(fakeItem);

    const result = await updateItem('item-1', {
      title: 'My Link',
      url: 'https://example.com',
      tags: [],
    });

    expect(result.success).toBe(true);
  });
});

describe('deleteItem action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns error when not authenticated', async () => {
    mockAuth.mockResolvedValue(null);

    const result = await deleteItem('item-1');

    expect(result).toEqual({ success: false, error: 'Not authenticated.' });
    expect(mockDbDelete).not.toHaveBeenCalled();
  });

  it('returns error when DB throws', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } });
    mockDbDelete.mockRejectedValue(new Error('DB error'));

    const result = await deleteItem('item-1');

    expect(result).toEqual({ success: false, error: 'Failed to delete item.' });
  });

  it('returns success on happy path', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } });
    mockDbDelete.mockResolvedValue(undefined);

    const result = await deleteItem('item-1');

    expect(result).toEqual({ success: true, data: null });
    expect(mockDbDelete).toHaveBeenCalledWith('item-1', 'user-1');
  });
});
