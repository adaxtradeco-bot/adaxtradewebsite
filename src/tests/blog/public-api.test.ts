import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({ findMany: vi.fn() }));
vi.mock('@/lib/prisma', () => ({ prisma: { post: { findMany: mocks.findMany } } }));

import { GET } from '@/app/api/blog/posts/route';

const get = (qs: string) => GET(new NextRequest(`https://site.example/api/blog/posts${qs}`));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.findMany.mockResolvedValue([]);
});

describe('public blog posts API', () => {
  it('requires a valid language', async () => {
    expect((await get('')).status).toBe(400);
    expect((await get('?language=xx')).status).toBe(400);
    expect(mocks.findMany).not.toHaveBeenCalled();
  });

  it('defaults limit to 3 and clamps to 1..24', async () => {
    await get('?language=en');
    expect(mocks.findMany.mock.calls[0][0].take).toBe(3);
    await get('?language=en&limit=999');
    expect(mocks.findMany.mock.calls[1][0].take).toBe(24);
    await get('?language=en&limit=0');
    expect(mocks.findMany.mock.calls[2][0].take).toBe(1);
    await get('?language=en&limit=abc');
    expect(mocks.findMany.mock.calls[3][0].take).toBe(3);
  });

  it('filters visible posts and by category/tag', async () => {
    await get('?language=fa&categorySlug=news&tagSlug=ai');
    const where = mocks.findMany.mock.calls[0][0].where;
    expect(where.language).toBe('fa');
    expect(where.OR).toHaveLength(2);
    expect(where.category).toEqual({ slug: 'news' });
    expect(where.tags).toEqual({ some: { slug: 'ai' } });
  });

  it('returns the documented shape', async () => {
    const publishedAt = new Date('2026-01-01T00:00:00Z');
    mocks.findMany.mockResolvedValue([
      { id: 'p1', slug: 'hello', title: 'Hello', excerpt: 'x', coverImage: null, coverImageAlt: null, publishedAt, scheduledAt: null, category: { name: 'News', slug: 'news' }, author: { name: 'Ann' } },
    ]);
    const body = await (await get('?language=en')).json();
    expect(body.posts[0]).toEqual({
      id: 'p1', slug: 'hello', title: 'Hello', excerpt: 'x', coverImage: null, coverImageAlt: null,
      publishedAt: publishedAt.toISOString(), category: { name: 'News', slug: 'news' }, author: { name: 'Ann' }, url: '/en/blog/hello',
    });
  });
});
