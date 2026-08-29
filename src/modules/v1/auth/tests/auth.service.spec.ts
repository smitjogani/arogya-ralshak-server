import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { AuthService } from '../auth.service';
import { prisma } from '../../../../../config/prisma';

vi.mock('../../../../../config/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock('argon2');
vi.mock('jsonwebtoken');
vi.mock('../../../../../config/env', () => ({
  env: {
    JWT_SECRET: 'test_secret'
  }
}));

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    vi.clearAllMocks();
  });

  it('should successfully register a user', async () => {
    (prisma.user.findUnique as any).mockResolvedValue(null);
    (argon2.hash as any).mockResolvedValue('hashed_password');
    (prisma.user.create as any).mockResolvedValue({
      id: 'uuid-123',
      email: 'test@test.com',
      fullName: 'Test User',
      passwordHash: 'hashed_password',
    });

    const result = await authService.register({
      email: 'test@test.com',
      password: 'password123',
      fullName: 'Test User',
    });

    expect(result.id).toBe('uuid-123');
    expect(prisma.user.create).toHaveBeenCalled();
  });

  it('should throw error if email exists during registration', async () => {
    (prisma.user.findUnique as any).mockResolvedValue({ id: 'uuid-123' });

    await expect(
      authService.register({
        email: 'test@test.com',
        password: 'password123',
        fullName: 'Test User',
      })
    ).rejects.toThrow('Email already in use');
  });

  it('should successfully login a user', async () => {
    (prisma.user.findUnique as any).mockResolvedValue({
      id: 'uuid-123',
      email: 'test@test.com',
      passwordHash: 'hashed_password',
      fullName: 'Test User',
    });
    (argon2.verify as any).mockResolvedValue(true);
    (jwt.sign as any).mockReturnValue('mocked_token');

    const result = await authService.login({
      email: 'test@test.com',
      password: 'password123',
    });

    expect(result.token).toBe('mocked_token');
    expect(result.user.id).toBe('uuid-123');
  });
});
