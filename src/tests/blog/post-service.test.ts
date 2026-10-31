import { describe, it, expect, vi, beforeEach } from 'vitest';

const db = vi.hoisted(() => ({
  post: { findUnique: vi.fn(), findFirst: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(), deleteMany: vi.fn(), findMany: vi.fn() },
  postGroup: { create: vi.fn(), deleteMany: vi.fn() },
  blogCategory: { findFirst: vi.fn(), create: vi.fn() },
  blogTag: { upsert: vi.fn() },
}));
vi.mock('@/lib/prisma', () => ({ prisma: db }));

import { addTranslation, createPost, deletePost, updatePost } from '@/lib/blog/post-service';

beforeEach(() => {
  vi.clearAllMocks();
  db.post.findUnique.mockResolvedValue(null);
  db.post.create.mockImplementation(async ({ data }: any) => ({ id: 'new', ...data }));
  db.postGroup.create.mockResolvedValue({ id: 'g1' });
});

describe('createPost', () => {
  it('returns the existing post for a repeated externalId', async () => {
    const existing = { id: 'old', externalId: 'x1' };
    db.post.findUnique.mockResolvedValueOnce(existing);
    const result = await createPost({ language: 'fa', title: 'T', externalId: 'x1' }, { source: 'api' });
    expect(result).toEqual({ post: existing, created: false });
    expect(db.post.create).not.toHaveBeenCalled();
  });

  it('sanitizes sections, computes reading time and defaults to draft', async () => {
    const { post } = await createPost(
      {
        language: 'en',
        title: 'Hello',
        sections: [{ id: 'a', type: 'blog-html', order: 0, data: { html: '<script>x</script><p>one two three</p>' } }],
      },
      { source: 'api' }
    );
    expect(post.builderData).not.toContain('script');
    expect(post.readingTime).toBe(1);
    expect(post.status).toBe('draft');
    expect(post.slug).toBe('hello');
  });

  it('adds a numeric suffix when the slug is taken by an API call', async () => {
    db.post.findUnique.mockImplementation(async ({ where }: any) => (where.language_slug?.slug === 'hello' ? { id: 'z' } : null));
    const { post } = await createPost({ language: 'en', title: 'Hello' }, { source: 'api' });
    expect(post.slug).toBe('hello-2');
  });

  it('rejects an explicit admin slug that is taken', async () => {
    db.post.findUnique.mockResolvedValue({ id: 'z' });
    await expect(createPost({ language: 'en', title: 'Hello', slug: 'hello' }, { source: 'admin' })).rejects.toMatchObject({ status: 409 });
  });

  it('joins the group of translationOf and refuses a language already present', async () => {
    db.post.findFirst
      .mockResolvedValueOnce({ id: 'o', language: 'en', postGroupId: 'g9' })
      .mockResolvedValueOnce(null);
    const { post } = await createPost({ language: 'fa', title: 'T', translationOf: 'o' }, { source: 'api' });
    expect(post.postGroupId).toBe('g9');

    db.post.findFirst
      .mockResolvedValueOnce({ id: 'o', language: 'en', postGroupId: 'g9' })
      .mockResolvedValueOnce({ id: 'dup' });
    await expect(createPost({ language: 'fa', title: 'T2', translationOf: 'o' }, { source: 'api' })).rejects.toMatchObject({ status: 409 });
  });

  it('sets publishedAt when created as published', async () => {
    const { post } = await createPost({ language: 'en', title: 'P', status: 'published' }, { source: 'admin' });
    expect(post.publishedAt).toBeInstanceOf(Date);
  });
});

describe('updatePost', () => {
  it('keeps the original publishedAt when re-publishing', async () => {
    const publishedAt = new Date('2026-01-01');
    db.post.findUnique.mockResolvedValueOnce({ id: 'p', language: 'en', slug: 's', publishedAt });
    db.post.update.mockImplementation(async ({ data }: any) => data);
    const data: any = await updatePost('p', { status: 'published' });
    expect(data.publishedAt).toBe(publishedAt);
  });

  it('404s for a missing post', async () => {
    await expect(updatePost('nope', { title: 'x' })).rejects.toMatchObject({ status: 404 });
  });
});

describe('deletePost', () => {
  it('removes the group when it has no posts left', async () => {
    db.post.findUnique.mockResolvedValueOnce({ postGroupId: 'g1' });
    await deletePost('p');
    expect(db.postGroup.deleteMany).toHaveBeenCalledWith({ where: { id: { in: ['g1'] }, posts: { none: {} } } });
  });
});

describe('addTranslation', () => {
  it('copies body and cover into a draft in the same group', async () => {
    db.post.findUnique.mockResolvedValueOnce({
      id: 'o', language: 'en', title: 'Hi', builderData: '[1]', coverImage: '/c.jpg', postGroupId: 'g9', category: null,
    });
    db.post.findFirst.mockResolvedValueOnce(null);
    const post: any = await addTranslation('o', 'fa');
    expect(post).toMatchObject({ language: 'fa', builderData: '[1]', coverImage: '/c.jpg', postGroupId: 'g9', status: 'draft' });
  });
});
