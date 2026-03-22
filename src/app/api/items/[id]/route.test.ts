import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('@/lib/db/items', () => ({
  getItemById: vi.fn(),
}));

vi.mock('@/lib/constants/demo', () => ({
  DEMO_USER_EMAIL: 'demo@devstash.io',
}));

import { GET } from './route';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getItemById } from '@/lib/db/items';

const mockAuth = auth as ReturnType<typeof vi.fn>;
const mockFindUnique = prisma.user.findUnique as ReturnType<typeof vi.fn>;
const mockGetItemById = getItemById as ReturnType<typeof vi.fn>;

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

const fakeItem = {
  id: 'item-1',
  title: 'Test Snippet',
  description: 'A test',
  content: 'console.log("hi")',
  fileUrl: null,
  fileName: null,
  fileSize: null,
  url: null,
  language: 'javascript',
  isFavorite: false,
  isPinned: true,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-02'),
  itemType: { name: 'snippet', icon: 'Code', color: '#3b82f6' },
  tags: [{ name: 'js' }],
  collections: [{ collection: { id: 'col-1', name: 'React Patterns' } }],
};

describe('GET /api/items/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when no user is found', async () => {
    mockAuth.mockResolvedValue(null);
    mockFindUnique.mockResolvedValue(null);

    const res = await GET(new Request('http://localhost'), makeParams('item-1'));
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe('Unauthorized');
  });

  it('falls back to demo user email when no session', async () => {
    mockAuth.mockResolvedValue(null);
    mockFindUnique.mockResolvedValue({ id: 'demo-user-id' });
    mockGetItemById.mockResolvedValue(fakeItem);

    await GET(new Request('http://localhost'), makeParams('item-1'));

    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { email: 'demo@devstash.io' },
      select: { id: true },
    });
  });

  it('uses session email when authenticated', async () => {
    mockAuth.mockResolvedValue({ user: { email: 'user@example.com' } });
    mockFindUnique.mockResolvedValue({ id: 'user-id' });
    mockGetItemById.mockResolvedValue(fakeItem);

    await GET(new Request('http://localhost'), makeParams('item-1'));

    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { email: 'user@example.com' },
      select: { id: true },
    });
  });

  it('returns 404 when item is not found', async () => {
    mockAuth.mockResolvedValue({ user: { email: 'user@example.com' } });
    mockFindUnique.mockResolvedValue({ id: 'user-id' });
    mockGetItemById.mockResolvedValue(null);

    const res = await GET(new Request('http://localhost'), makeParams('nonexistent'));
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe('Not found');
  });

  it('returns item data with status 200', async () => {
    mockAuth.mockResolvedValue({ user: { email: 'user@example.com' } });
    mockFindUnique.mockResolvedValue({ id: 'user-id' });
    mockGetItemById.mockResolvedValue(fakeItem);

    const res = await GET(new Request('http://localhost'), makeParams('item-1'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.id).toBe('item-1');
    expect(json.title).toBe('Test Snippet');
    expect(json.itemType.name).toBe('snippet');
    expect(json.tags).toEqual([{ name: 'js' }]);
    expect(json.collections).toEqual([{ collection: { id: 'col-1', name: 'React Patterns' } }]);
  });

  it('calls getItemById with the correct id and userId', async () => {
    mockAuth.mockResolvedValue({ user: { email: 'user@example.com' } });
    mockFindUnique.mockResolvedValue({ id: 'user-id' });
    mockGetItemById.mockResolvedValue(fakeItem);

    await GET(new Request('http://localhost'), makeParams('item-1'));

    expect(mockGetItemById).toHaveBeenCalledWith('item-1', 'user-id');
  });
});
