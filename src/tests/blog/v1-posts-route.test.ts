import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

const mocks = vi.hoisted(() => ({
  verifyApiKey: vi.fn(),
  getApiCanPublish: vi.fn(),
  importCover: vi.fn(),
  db: {
    post: { findUnique: vi.fn(), findFirst: vi.fn(), create: vi.fn(), findMany: vi.fn() },
    postGroup: { create: vi.fn(), deleteMany: vi.fn() },
    blogCategory: { findFirst: vi.fn(), create: vi.fn() },
    blogTag: { upsert: vi.fn() },
    user: { findUnique: vi.fn() },
  },
}));
vi.mock('@/lib/prisma', () => ({ prisma: mocks.db }));
vi.mock('@/lib/blog/api-keys', () => ({ verifyApiKey: mocks.verifyApiKey, getApiCanPublish: mocks.getApiCanPublish }));
vi.mock('@/lib/blog/cover-import', () => ({ importCover: mocks.importCover }));

import { POST } from '@/app/api/v1/blog/posts/route';

const { db } = mocks;
const send = (body: unknown, headers: Record<string, string> = {}) =>
  POST(
    new NextRequest('https://site.example/api/v1/blog/posts', {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...headers },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    })
  );
const valid = { language: 'en', title: 'Hello', html: '<p>Body</p>' };

beforeEach(() => {
  vi.clearAllMocks();
  mocks.verifyApiKey.mockResolvedValue({ ok: true, key: { id: 'k1', createdById: 'admin1' } });
  mocks.getApiCanPublish.mockResolvedValue(false);
  db.post.findUnique.mockResolvedValue(null);
  db.post.create.mockImplementation(async ({ data }: any) => ({ id: 'p1', ...data }));
  db.postGroup.create.mockResolvedValue({ id: 'g1' });
});

describe('POST /api/v1/blog/posts', () => {
  it('passes through auth failures', async () => {
    for (const status of [401, 403]) {
      mocks.verifyApiKey.mockResolvedValueOnce({ ok: false, response: NextResponse.json({ error: 'x' }, { status }) });
      expect((await send(valid)).status).toBe(status);
    }
    expect(db.post.create).not.toHaveBeenCalled();
  });

  it('rejects oversized bodies with 413 and bad JSON with 400', async () => {
    expect((await send(valid, { 'content-length': String(2 * 1024 * 1024) })).status).toBe(413);
    const big = await send({ ...valid, html: 'x'.repeat(1024 * 1024 + 1) });
    expect(big.status).toBe(413);
    expect((await big.json()).error).toBe('payload_too_large');
    expect((await send('{nope')).status).toBe(400);
  });

  it('returns 422 with issues for invalid payloads', async () => {
    const res = await send({ language: 'en', title: 'No body' });
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.error).toBe('validation_error');
    expect(body.issues.length).toBeGreaterThan(0);
  });

  it('creates a post (201) with source api, the key owner as author, and links', async () => {
    const res = await send(valid);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toMatchObject({ id: 'p1', status: 'draft', url: 'https://site.example/en/blog/hello', previewUrl: 'https://site.example/admin/blog/posts/p1', warnings: [] });
    expect(db.post.create.mock.calls[0][0].data).toMatchObject({ source: 'api', authorId: 'admin1' });
  });

  it('is idempotent by externalId (200, no second create)', async () => {
    db.post.findUnique.mockResolvedValueOnce({ id: 'old', slug: 'hello', language: 'en', status: 'draft' });
    const res = await send({ ...valid, externalId: 'x1' });
    expect(res.status).toBe(200);
    expect((await res.json()).id).toBe('old');
    expect(db.post.create).not.toHaveBeenCalled();
  });

  it('downgrades published to draft with a warning unless publishing is allowed', async () => {
    const res = await send({ ...valid, status: 'published' });
    const body = await res.json();
    expect(body.status).toBe('draft');
    expect(body.warnings).toContain('status downgraded to draft: API publishing is disabled');

    mocks.getApiCanPublish.mockResolvedValue(true);
    expect((await (await send({ ...valid, status: 'published' })).json()).status).toBe('published');
  });

  it('strips scripts from the saved body', async () => {
    await send({ ...valid, html: '<p>ok</p><script>alert(1)</script>' });
    expect(db.post.create.mock.calls[0][0].data.builderData).not.toContain('script');
  });

  it('keeps the post and adds a warning when the cover import fails', async () => {
    mocks.importCover.mockResolvedValue({ error: 'cover is not an image' });
    const res = await send({ ...valid, coverImageUrl: 'https://cdn.example.com/c.png' });
    expect(res.status).toBe(201);
    expect((await res.json()).warnings[0]).toContain('cover is not an image');
    expect(db.post.create.mock.calls[0][0].data.coverImage).toBeUndefined();
  });

  it('warns on an unknown authorEmail and falls back to the key owner', async () => {
    db.user.findUnique.mockResolvedValue(null);
    const body = await (await send({ ...valid, authorEmail: 'nobody@example.com' })).json();
    expect(body.warnings[0]).toContain('nobody@example.com');
    expect(db.post.create.mock.calls[0][0].data.authorId).toBe('admin1');
  });
});
