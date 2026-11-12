// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

const db = vi.hoisted(() => ({ user: { findUnique: vi.fn() } }));
vi.mock('@/lib/prisma', () => ({ prisma: db }));

import { POST } from '@/app/api/admin/auth/route';

const login = (body: unknown, ip: string) =>
  POST(
    new Request('http://localhost/api/admin/auth', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
      body: JSON.stringify(body),
    }) as any,
  );

describe('POST /api/admin/auth', () => {
  beforeEach(() => {
    db.user.findUnique.mockReset().mockResolvedValue(null);
  });

  it('validates the body', async () => {
    expect((await login({ email: 'a@example.com' }, '10.0.0.1')).status).toBe(400);
    expect((await login({ email: 1, password: 'x' }, '10.0.0.1')).status).toBe(400);
  });

  it('locks an email after 5 failed attempts with 429 + Retry-After', async () => {
    for (let i = 0; i < 5; i++) {
      // Different IPs: the per-email limit must still trip.
      expect((await login({ email: 'Admin@example.com', password: 'bad' }, `10.1.0.${i}`)).status).toBe(401);
    }
    const res = await login({ email: 'admin@example.com', password: 'bad' }, '10.1.0.200');
    expect(res.status).toBe(429);
    expect(Number(res.headers.get('Retry-After'))).toBeGreaterThan(0);
  }, 20_000);

  it('limits failed attempts per IP across emails', async () => {
    for (let i = 0; i < 10; i++) {
      expect((await login({ email: `u${i}@example.com`, password: 'bad' }, '10.2.0.1')).status).toBe(401);
    }
    expect((await login({ email: 'fresh@example.com', password: 'bad' }, '10.2.0.1')).status).toBe(429);
  }, 30_000);
});
