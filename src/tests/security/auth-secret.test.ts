// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import jwt from 'jsonwebtoken';

vi.mock('@/lib/prisma', () => ({ prisma: {} }));

import { generateToken, verifyToken, getJwtSecret } from '@/lib/auth';

const user = { id: 'u1', email: 'a@example.com', name: 'A', role: 'admin' };
const GOOD_SECRET = 'test-secret-that-is-long-enough-0123456789';

describe('JWT secret handling', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('signs and verifies with a valid secret', () => {
    vi.stubEnv('JWT_SECRET', GOOD_SECRET);
    const token = generateToken(user);
    expect(verifyToken(token)).toMatchObject(user);
  });

  it('has no fallback: missing secret makes generateToken throw', () => {
    vi.stubEnv('JWT_SECRET', '');
    expect(getJwtSecret()).toBeNull();
    expect(() => generateToken(user)).toThrow(/JWT_SECRET/);
  });

  it('rejects a too-short secret', () => {
    vi.stubEnv('JWT_SECRET', 'short');
    expect(getJwtSecret()).toBeNull();
    expect(() => generateToken(user)).toThrow(/JWT_SECRET/);
  });

  it('verifyToken returns null when the secret is unavailable', () => {
    vi.stubEnv('JWT_SECRET', GOOD_SECRET);
    const token = generateToken(user);
    vi.stubEnv('JWT_SECRET', '');
    expect(verifyToken(token)).toBeNull();
  });

  it('does not accept tokens signed with the old fallback secret', () => {
    vi.stubEnv('JWT_SECRET', '');
    const forged = jwt.sign(user, 'fallback-secret');
    expect(verifyToken(forged)).toBeNull();
    vi.stubEnv('JWT_SECRET', GOOD_SECRET);
    expect(verifyToken(forged)).toBeNull();
  });

  it('rejects unsigned (alg: none) tokens', () => {
    vi.stubEnv('JWT_SECRET', GOOD_SECRET);
    const unsigned = jwt.sign(user, '', { algorithm: 'none' });
    expect(verifyToken(unsigned)).toBeNull();
  });
});
