import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn(),
  },
}));

import { authorizeCredentials } from './authorize';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

const mockFindUnique = prisma.user.findUnique as ReturnType<typeof vi.fn>;
const mockCompare = bcrypt.compare as ReturnType<typeof vi.fn>;

const fakeUser = {
  id: 'user-1',
  email: 'boss@devstash.io',
  name: 'Boss Duy',
  image: null,
  password: 'hashed_pw',
};

describe('authorizeCredentials', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when email is missing', async () => {
    const result = await authorizeCredentials(undefined, 'password123');
    expect(result).toBeNull();
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it('returns null when password is missing', async () => {
    const result = await authorizeCredentials('boss@devstash.io', undefined);
    expect(result).toBeNull();
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it('returns null when user is not found', async () => {
    mockFindUnique.mockResolvedValue(null);
    const result = await authorizeCredentials('boss@devstash.io', 'password123');
    expect(result).toBeNull();
  });

  it('returns null when user has no password (OAuth-only account)', async () => {
    mockFindUnique.mockResolvedValue({ ...fakeUser, password: null });
    const result = await authorizeCredentials('boss@devstash.io', 'password123');
    expect(result).toBeNull();
    expect(mockCompare).not.toHaveBeenCalled();
  });

  it('returns null when password is incorrect', async () => {
    mockFindUnique.mockResolvedValue(fakeUser);
    mockCompare.mockResolvedValue(false);
    const result = await authorizeCredentials('boss@devstash.io', 'wrong');
    expect(result).toBeNull();
  });

  it('returns user object when credentials are valid', async () => {
    mockFindUnique.mockResolvedValue(fakeUser);
    mockCompare.mockResolvedValue(true);
    const result = await authorizeCredentials('boss@devstash.io', 'password123');
    expect(result).toEqual({
      id: 'user-1',
      email: 'boss@devstash.io',
      name: 'Boss Duy',
      image: null,
    });
  });
});
