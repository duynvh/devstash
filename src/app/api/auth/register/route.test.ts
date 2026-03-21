import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed_password'),
    compare: vi.fn(),
  },
}));

import { POST } from './route';
import { prisma } from '@/lib/prisma';

const mockFindUnique = prisma.user.findUnique as ReturnType<typeof vi.fn>;
const mockCreate = prisma.user.create as ReturnType<typeof vi.fn>;

function makeRequest(body: object) {
  return new Request('http://localhost/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 when fields are missing', async () => {
    const res = await POST(makeRequest({ name: 'Test', email: 'test@test.com' }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('All fields are required');
  });

  it('returns 400 when passwords do not match', async () => {
    const res = await POST(makeRequest({
      name: 'Test',
      email: 'test@test.com',
      password: 'abc123',
      confirmPassword: 'different',
    }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Passwords do not match');
  });

  it('returns 409 when user already exists', async () => {
    mockFindUnique.mockResolvedValue({ id: '1', email: 'test@test.com' });

    const res = await POST(makeRequest({
      name: 'Test',
      email: 'test@test.com',
      password: 'password123',
      confirmPassword: 'password123',
    }));
    expect(res.status).toBe(409);
    const json = await res.json();
    expect(json.error).toBe('User already exists');
  });

  it('creates user and returns 201 on success', async () => {
    mockFindUnique.mockResolvedValue(null);
    mockCreate.mockResolvedValue({ id: 'new-id', name: 'Test', email: 'test@test.com' });

    const res = await POST(makeRequest({
      name: 'Test',
      email: 'test@test.com',
      password: 'password123',
      confirmPassword: 'password123',
    }));
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.user.email).toBe('test@test.com');
  });

  it('hashes password before creating user', async () => {
    const bcrypt = (await import('bcryptjs')).default;
    mockFindUnique.mockResolvedValue(null);
    mockCreate.mockResolvedValue({ id: 'new-id', name: 'Test', email: 'test@test.com' });

    await POST(makeRequest({
      name: 'Test',
      email: 'test@test.com',
      password: 'password123',
      confirmPassword: 'password123',
    }));

    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ password: 'hashed_password' }),
      }),
    );
  });
});
