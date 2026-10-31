import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createHash } from 'crypto';

const db = vi.hoisted(() => ({
  apiKey: { findUnique: vi.fn(), update: vi.fn() },
  siteSettings: { findFirst: vi.fn() },
}));
vi.mock('@/lib/prisma', () => ({ prisma: db }));

import { generateApiKey, getApiCanPublish, verifyApiKey } from '@/lib/blog/api-keys';

const req = (key?: string) => new Request('http://x/api', { headers: key ? { authorization: `Bearer ${key}` } : {} });
const rowFor = (gen: ReturnType<typeof generateApiKey>, over: Record<string, unknown> = {}) => ({
  id: `id-${gen.prefix}`, prefix: gen.prefix, hashedKey: gen.hashedKey, scopes: 'blog:write', revokedAt: null, createdById: 'u1', ...over,
});

beforeEach(() => {
  vi.clearAllMocks();
  db.apiKey.update.mockResolvedValue({});
});

describe('generateApiKey', () => {
  it('uses the bk_<prefix8>_<secret32> format and a sha256 hash', () => {
    const { key, prefix, hashedKey } = generateApiKey();
    expect(key).toMatch(/^bk_[0-9a-f]{8}_[A-Za-z0-9_-]{32}$/);
    expect(key.split('_')[1]).toBe(prefix);
    expect(hashedKey).toBe(createHash('sha256').update(key).digest('hex'));
    expect(generateApiKey().key).not.toBe(key);
  });
});

describe('verifyApiKey', () => {
  it('accepts a valid key and records last use', async () => {
    const gen = generateApiKey();
    db.apiKey.findUnique.mockResolvedValue(rowFor(gen));
    const result = await verifyApiKey(req(gen.key), 'blog:write');
    expect(result.ok).toBe(true);
    expect(db.apiKey.update).toHaveBeenCalledOnce();
  });

  it('rejects a wrong secret, a revoked key, an unknown prefix and a missing header with 401', async () => {
    const gen = generateApiKey();
    const wrong = `bk_${gen.prefix}_${'a'.repeat(32)}`;
    db.apiKey.findUnique.mockResolvedValue(rowFor(gen));
    const bad = await verifyApiKey(req(wrong), 'blog:write');
    expect(!bad.ok && bad.response.status).toBe(401);

    db.apiKey.findUnique.mockResolvedValue(rowFor(gen, { revokedAt: new Date() }));
    const revoked = await verifyApiKey(req(gen.key), 'blog:write');
    expect(!revoked.ok && revoked.response.status).toBe(401);

    db.apiKey.findUnique.mockResolvedValue(null);
    const unknown = await verifyApiKey(req(gen.key), 'blog:write');
    expect(!unknown.ok && unknown.response.status).toBe(401);

    const none = await verifyApiKey(req(), 'blog:write');
    expect(!none.ok && none.response.status).toBe(401);
    expect(db.apiKey.update).not.toHaveBeenCalled();
  });

  it('returns 403 when the scope is missing', async () => {
    const gen = generateApiKey();
    db.apiKey.findUnique.mockResolvedValue(rowFor(gen, { scopes: 'other' }));
    const result = await verifyApiKey(req(gen.key), 'blog:write');
    expect(!result.ok && result.response.status).toBe(403);
    expect(!result.ok && (await result.response.json())).toEqual({ error: 'insufficient_scope' });
  });

  it('rate limits the 61st request within a minute', async () => {
    const gen = generateApiKey();
    db.apiKey.findUnique.mockResolvedValue(rowFor(gen));
    for (let i = 0; i < 60; i++) expect((await verifyApiKey(req(gen.key), 'blog:write')).ok).toBe(true);
    const limited = await verifyApiKey(req(gen.key), 'blog:write');
    expect(!limited.ok && limited.response.status).toBe(429);
    expect(!limited.ok && Number(limited.response.headers.get('Retry-After'))).toBeGreaterThan(0);
  });
});

describe('getApiCanPublish', () => {
  it('defaults to false and reads blog.apiCanPublish', async () => {
    db.siteSettings.findFirst.mockResolvedValueOnce(null);
    expect(await getApiCanPublish()).toBe(false);
    db.siteSettings.findFirst.mockResolvedValueOnce({ data: JSON.stringify({ blog: { apiCanPublish: true } }) });
    expect(await getApiCanPublish()).toBe(true);
  });
});
