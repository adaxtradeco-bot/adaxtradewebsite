import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => ({ listPosts: vi.fn() }));
vi.mock('@/lib/blog/queries', () => ({ listPosts: mocks.listPosts }));
vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND');
  },
  redirect: (to: string) => {
    throw new Error(`REDIRECT:${to}`);
  },
}));

import { indexPageHref, isOutOfRange, parsePageParam } from '@/app/[lang]/blog/_components/pagination-math';
import BlogPagedPage from '@/app/[lang]/blog/page/[page]/page';

describe('pagination math', () => {
  it('parses page params', () => {
    expect(parsePageParam('2')).toBe(2);
    expect(parsePageParam('0')).toBeNull();
    expect(parsePageParam('-1')).toBeNull();
    expect(parsePageParam('abc')).toBeNull();
    expect(parsePageParam(undefined)).toBeNull();
  });
  it('detects out-of-range pages', () => {
    expect(isOutOfRange(1, 0)).toBe(false);
    expect(isOutOfRange(3, 3)).toBe(false);
    expect(isOutOfRange(4, 3)).toBe(true);
  });
  it('builds hrefs', () => {
    expect(indexPageHref('en', 1)).toBe('/en/blog');
    expect(indexPageHref('en', 3)).toBe('/en/blog/page/3');
  });
});

describe('paged blog route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('404s when page exceeds totalPages', async () => {
    mocks.listPosts.mockResolvedValue({ posts: [], total: 13, page: 5, totalPages: 2 });
    await expect(BlogPagedPage({ params: { lang: 'en', page: '5' } })).rejects.toThrow('NEXT_NOT_FOUND');
  });
  it('404s on a non-numeric page and redirects page 1', async () => {
    await expect(BlogPagedPage({ params: { lang: 'en', page: 'x' } })).rejects.toThrow('NEXT_NOT_FOUND');
    await expect(BlogPagedPage({ params: { lang: 'en', page: '1' } })).rejects.toThrow('REDIRECT:/en/blog');
  });
  it('renders a valid page', async () => {
    mocks.listPosts.mockResolvedValue({ posts: [], total: 13, page: 2, totalPages: 2 });
    await expect(BlogPagedPage({ params: { lang: 'en', page: '2' } })).resolves.toBeTruthy();
    expect(mocks.listPosts).toHaveBeenCalledWith({ language: 'en', page: 2 });
  });
});
