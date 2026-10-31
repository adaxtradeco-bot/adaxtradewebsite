import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const api = vi.hoisted(() => ({
  posts: { list: vi.fn(), get: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn(), addTranslation: vi.fn(), bulk: vi.fn() },
  categories: { list: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn() },
  tags: { list: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn() },
}));
const push = vi.hoisted(() => vi.fn());

vi.mock('@/lib/admin/api', () => ({ blogApi: api }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }), useParams: () => ({ id: 'p1' }) }));
vi.mock('@/components/admin/PageBuilder/MediaBrowser', () => ({ MediaBrowser: () => null }));

import AdminBlogPosts from '@/app/admin/blog/posts/page';
import { PostForm } from '@/components/admin/blog/PostForm';
import { TermManager } from '@/components/admin/blog/TermManager';
import { SlugBlogNotice } from '@/components/admin/blog/SlugBlogNotice';

const row = (over = {}) => ({
  id: 'p1', title: 'Hello', slug: 'hello', language: 'en', status: 'published', source: 'api',
  publishedAt: '2026-01-01T00:00:00.000Z', scheduledAt: null, updatedAt: '2026-01-01T00:00:00.000Z',
  postGroupId: null, category: null, author: { id: 'u1', name: 'Ann' }, ...over,
});

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  api.categories.list.mockResolvedValue({ categories: [] });
  api.tags.list.mockResolvedValue({ tags: [] });
});

describe('posts list', () => {
  beforeEach(() => {
    api.posts.list.mockResolvedValue({
      posts: [row(), row({ id: 'p2', title: 'Second', status: 'draft', source: 'admin' })],
      total: 2, page: 1, totalPages: 1,
    });
  });

  it('renders rows with status and source badges', async () => {
    render(<AdminBlogPosts />);
    await screen.findByText('Hello');
    expect(screen.getAllByTestId('status-badge').map((b) => b.textContent)).toEqual(['published', 'draft']);
    expect(screen.getAllByTestId('source-badge').map((b) => b.textContent)).toEqual(['api', 'admin']);
  });

  it('hides bulk delete without canDelete and shows it for admins', async () => {
    localStorage.setItem('adminUser', JSON.stringify({ role: 'editor' }));
    const { unmount } = render(<AdminBlogPosts />);
    fireEvent.click(await screen.findByLabelText('Select Hello'));
    expect(screen.getByText('Publish')).toBeTruthy();
    expect(screen.queryByText('Delete')).toBeNull();
    unmount();

    localStorage.setItem('adminUser', JSON.stringify({ role: 'admin' }));
    render(<AdminBlogPosts />);
    fireEvent.click(await screen.findByLabelText('Select Hello'));
    await waitFor(() => expect(screen.getAllByText('Delete').length).toBeGreaterThan(0));
  });
});

describe('PostForm', () => {
  it('auto-generates the slug until it is edited manually', () => {
    render(<PostForm />);
    const title = screen.getByLabelText('Title') as HTMLInputElement;
    const slug = screen.getByLabelText('Slug') as HTMLInputElement;
    fireEvent.change(title, { target: { value: 'Hello World' } });
    expect(slug.value).toBe('hello-world');
    fireEvent.change(slug, { target: { value: 'custom' } });
    fireEvent.change(title, { target: { value: 'Another Title' } });
    expect(slug.value).toBe('custom');
  });

  it('shows the schedule date only when status is scheduled', () => {
    render(<PostForm />);
    expect(screen.queryByLabelText('Schedule date')).toBeNull();
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'scheduled' } });
    expect(screen.getByLabelText('Schedule date')).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'draft' } });
    expect(screen.queryByLabelText('Schedule date')).toBeNull();
  });

  it('creates tag chips on Enter and comma and submits them, then redirects', async () => {
    api.posts.create.mockResolvedValue({ post: { id: 'new1' } });
    render(<PostForm />);
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'T' } });
    const tags = screen.getByLabelText('Tags');
    fireEvent.change(tags, { target: { value: 'alpha' } });
    fireEvent.keyDown(tags, { key: 'Enter' });
    fireEvent.change(tags, { target: { value: 'beta' } });
    fireEvent.keyDown(tags, { key: ',' });
    expect(screen.getByLabelText('Remove tag alpha')).toBeTruthy();
    expect(screen.getByLabelText('Remove tag beta')).toBeTruthy();

    fireEvent.click(screen.getByText('Create post'));
    await waitFor(() => expect(push).toHaveBeenCalledWith('/admin/blog/posts/new1'));
    expect(api.posts.create.mock.calls[0][0]).toMatchObject({ title: 'T', slug: 't', tags: ['alpha', 'beta'], language: 'en' });
  });

  it('shows server errors such as a slug conflict', async () => {
    api.posts.create.mockRejectedValue(new Error('Slug already exists'));
    render(<PostForm />);
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'T' } });
    fireEvent.click(screen.getByText('Create post'));
    expect((await screen.findByRole('alert')).textContent).toContain('Slug already exists');
  });

  it('renders translation tabs from siblings', () => {
    const post = { id: 'p1', title: 'A', slug: 'a', language: 'en', status: 'draft', tags: [], siblings: [{ id: 'p1', language: 'en', slug: 'a' }, { id: 'p2', language: 'fa', slug: 'b' }] };
    render(<PostForm post={post} />);
    expect(screen.getAllByRole('tab').map((t) => t.textContent)).toEqual(['EN', 'FA']);
  });
});

describe('TermManager', () => {
  it('lists categories with post counts', async () => {
    api.categories.list.mockResolvedValue({
      categories: [{ id: 'c1', name: 'News', slug: 'news', language: 'en', groupKey: 'news', _count: { posts: 3 } }],
    });
    render(<TermManager kind="categories" />);
    await screen.findByText('News');
    expect(screen.getByText('3')).toBeTruthy();
  });
});

describe('SlugBlogNotice', () => {
  it('warns for blog index slugs only', () => {
    const { rerender } = render(<SlugBlogNotice slug="/en/blog" language="en" />);
    expect(screen.getByRole('alert')).toBeTruthy();
    rerender(<SlugBlogNotice slug="blog" language="en" />);
    expect(screen.getByRole('alert')).toBeTruthy();
    rerender(<SlugBlogNotice slug="about" language="en" />);
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
