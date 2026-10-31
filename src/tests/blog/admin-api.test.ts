import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

const db = vi.hoisted(() => ({
  post: { findMany: vi.fn(), count: vi.fn(), findUnique: vi.fn(), findFirst: vi.fn() },
  blogCategory: { create: vi.fn() },
}));
const svc = vi.hoisted(() => ({
  createPost: vi.fn(), updatePost: vi.fn(), deletePost: vi.fn(), bulkDelete: vi.fn(), bulkUpdateStatus: vi.fn(), addTranslation: vi.fn(),
}));
const authState = vi.hoisted(() => ({ canDelete: true, loggedIn: true }));

vi.mock('@/lib/prisma', () => ({ prisma: db }));
vi.mock('@/lib/api-auth', () => {
  const deny = (status: number) => ({ ok: false, response: NextResponse.json({ error: 'x' }, { status }) });
  const authenticateRequest = () => (authState.loggedIn ? { ok: true, user: { id: 'u1', role: 'editor' } } : deny(401));
  return {
    authenticateRequest,
    authorizeDelete: () => (!authState.loggedIn ? deny(401) : authState.canDelete ? authenticateRequest() : deny(403)),
  };
});
vi.mock('@/lib/blog/post-service', async () => {
  const actual = await vi.importActual<typeof import('@/lib/blog/post-service')>('@/lib/blog/post-service');
  return { ...actual, ...svc };
});

import { BlogServiceError } from '@/lib/blog/post-service';
import * as posts from '@/app/api/admin/blog/posts/route';
import * as bulk from '@/app/api/admin/blog/posts/bulk/route';
import * as postById from '@/app/api/admin/blog/posts/[id]/route';
import * as categories from '@/app/api/admin/blog/categories/route';

const req = (url: string, body?: unknown, method = body ? 'POST' : 'GET') =>
  new NextRequest(`http://localhost${url}`, { method, body: body ? JSON.stringify(body) : undefined });

beforeEach(() => {
  vi.clearAllMocks();
  authState.canDelete = true;
  authState.loggedIn = true;
  db.post.findMany.mockResolvedValue([]);
  db.post.count.mockResolvedValue(0);
});

describe('posts list', () => {
  it('requires auth', async () => {
    authState.loggedIn = false;
    expect((await posts.GET(req('/api/admin/blog/posts'))).status).toBe(401);
  });

  it('builds filters and paginates', async () => {
    db.post.count.mockResolvedValue(45);
    const res = await posts.GET(req('/api/admin/blog/posts?language=fa&status=draft&q=ترکیه&page=3&pageSize=10'));
    const args = db.post.findMany.mock.calls[0][0];
    expect(args.where).toEqual({ language: 'fa', status: 'draft', title: { contains: 'ترکیه', mode: 'insensitive' } });
    expect(args).toMatchObject({ skip: 20, take: 10 });
    expect(await res.json()).toMatchObject({ total: 45, page: 3, totalPages: 5 });
  });

  it('caps page size at 100', async () => {
    await posts.GET(req('/api/admin/blog/posts?pageSize=5000'));
    expect(db.post.findMany.mock.calls[0][0].take).toBe(100);
  });
});

describe('posts create', () => {
  it('returns 422 with issues for an invalid body', async () => {
    const res = await posts.POST(req('/api/admin/blog/posts', { language: 'en' }));
    expect(res.status).toBe(422);
    expect((await res.json()).issues.length).toBeGreaterThan(0);
  });

  it('defaults the author to the logged-in user and creates with source admin', async () => {
    svc.createPost.mockResolvedValue({ post: { id: 'p1' }, created: true });
    const res = await posts.POST(req('/api/admin/blog/posts', { language: 'en', title: 'Hi' }));
    expect(res.status).toBe(201);
    expect(svc.createPost).toHaveBeenCalledWith(expect.objectContaining({ authorId: 'u1' }), { source: 'admin' });
  });

  it('maps a slug conflict to 409', async () => {
    svc.createPost.mockRejectedValue(new BlogServiceError('conflict', 'Slug already in use', 409));
    expect((await posts.POST(req('/api/admin/blog/posts', { language: 'en', title: 'Hi', slug: 'hi' }))).status).toBe(409);
  });
});

describe('post delete', () => {
  const ctx = { params: { id: 'p1' } };

  it('is forbidden without canDelete', async () => {
    authState.canDelete = false;
    expect((await postById.DELETE(req('/api/admin/blog/posts/p1', undefined, 'DELETE'), ctx)).status).toBe(403);
    expect(svc.deletePost).not.toHaveBeenCalled();
  });

  it('deletes with permission', async () => {
    expect((await postById.DELETE(req('/api/admin/blog/posts/p1', undefined, 'DELETE'), ctx)).status).toBe(200);
    expect(svc.deletePost).toHaveBeenCalledWith('p1');
  });
});

describe('bulk', () => {
  it('routes status actions to bulkUpdateStatus', async () => {
    svc.bulkUpdateStatus.mockResolvedValue(2);
    const res = await bulk.POST(req('/api/admin/blog/posts/bulk', { ids: ['a', 'b'], action: 'publish' }));
    expect(svc.bulkUpdateStatus).toHaveBeenCalledWith(['a', 'b'], 'published');
    expect(await res.json()).toMatchObject({ count: 2 });
  });

  it('requires canDelete for delete only', async () => {
    authState.canDelete = false;
    expect((await bulk.POST(req('/api/admin/blog/posts/bulk', { ids: ['a'], action: 'delete' }))).status).toBe(403);
    expect((await bulk.POST(req('/api/admin/blog/posts/bulk', { ids: ['a'], action: 'archive' }))).status).toBe(200);
    expect(svc.bulkDelete).not.toHaveBeenCalled();
  });

  it('rejects an unknown action', async () => {
    expect((await bulk.POST(req('/api/admin/blog/posts/bulk', { ids: ['a'], action: 'nuke' }))).status).toBe(422);
  });
});

describe('categories', () => {
  it('slugifies the name and maps a duplicate to 409', async () => {
    db.blogCategory.create.mockResolvedValueOnce({ id: 'c1' });
    await categories.POST(req('/api/admin/blog/categories', { name: 'واردات کالا', language: 'fa' }));
    expect(db.blogCategory.create.mock.calls[0][0].data.slug).toBe('واردات-کالا');

    db.blogCategory.create.mockRejectedValueOnce({ code: 'P2002' });
    expect((await categories.POST(req('/api/admin/blog/categories', { name: 'x', language: 'en' }))).status).toBe(409);
  });
});
