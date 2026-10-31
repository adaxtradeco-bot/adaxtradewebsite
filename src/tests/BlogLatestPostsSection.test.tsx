import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import BlogLatestPostsSection from '@/components/builder-sections/BlogLatestPostsSection';

vi.mock('@/lib/i18n/context', () => ({ useLanguage: () => ({ language: 'fa' }) }));

const post = (i: number) => ({
  id: `p${i}`,
  slug: `post ${i}`,
  title: `Title ${i}`,
  excerpt: `Excerpt ${i}`,
  coverImage: `/img${i}.jpg`,
  coverImageAlt: '',
  publishedAt: '2026-01-02T00:00:00.000Z',
  category: { name: 'Cat', slug: 'cat' },
  author: { name: 'Ann' },
  url: `/fa/blog/post%20${i}`,
});

const mockFetch = (posts: any[] | Error | 'bad') => {
  const f = vi.fn(async (..._args: any[]) => {
    if (posts instanceof Error) throw posts;
    if (posts === 'bad') return { ok: false, json: async () => ({}) };
    return { ok: true, json: async () => ({ posts }) };
  });
  vi.stubGlobal('fetch', f);
  return f;
};

const show = { cover: true, date: true, excerpt: true, author: true, category: true };

describe('BlogLatestPostsSection', () => {
  beforeEach(() => { vi.unstubAllGlobals(); });
  afterEach(() => { vi.unstubAllGlobals(); });

  it.each(['grid', 'list', 'carousel'])('renders N cards in %s layout', async (layout) => {
    mockFetch([post(1), post(2), post(3)]);
    const { container, findAllByTestId } = render(<BlogLatestPostsSection data={{ layout, columns: 3, show }} />);
    expect(await findAllByTestId('blog-card')).toHaveLength(3);
    expect(container.querySelector(`[data-layout="${layout}"]`)).not.toBeNull();
  });

  it('sends language, clamped count and filters', async () => {
    const f = mockFetch([post(1)]);
    render(<BlogLatestPostsSection data={{ count: 99, categorySlug: 'news', tagSlug: 't1', show }} />);
    await waitFor(() => expect(f).toHaveBeenCalled());
    const url = String(f.mock.calls[0][0]);
    expect(url).toContain('language=fa');
    expect(url).toContain('limit=24');
    expect(url).toContain('categorySlug=news');
    expect(url).toContain('tagSlug=t1');
  });

  it('hides disabled show parts', async () => {
    mockFetch([post(1)]);
    const { findAllByTestId, container, queryByText } = render(
      <BlogLatestPostsSection data={{ show: { cover: false, date: false, excerpt: false, author: false, category: false } }} />,
    );
    await findAllByTestId('blog-card');
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('time')).toBeNull();
    expect(queryByText('Excerpt 1')).toBeNull();
    expect(queryByText('Cat')).toBeNull();
    expect(queryByText(/Ann/)).toBeNull();
  });

  it('shows parts when enabled', async () => {
    mockFetch([post(1)]);
    const { findByText, container } = render(<BlogLatestPostsSection data={{ show }} />);
    await findByText('Excerpt 1');
    expect(container.querySelector('img')).not.toBeNull();
    expect(container.querySelector('time')).not.toBeNull();
  });

  it('renders nothing when empty on the public site, a hint in the builder', async () => {
    mockFetch([]);
    const pub = render(<BlogLatestPostsSection data={{}} />);
    await waitFor(() => expect(pub.container.innerHTML).toBe(''));
    const b = render(<BlogLatestPostsSection data={{}} isBuilder />);
    await waitFor(() => expect(b.container.textContent).toContain('هنوز'));
  });

  it('handles fetch errors without throwing', async () => {
    mockFetch(new Error('net'));
    const { container } = render(<BlogLatestPostsSection data={{}} />);
    await waitFor(() => expect(container.innerHTML).toBe(''));
    mockFetch('bad');
    const b = render(<BlogLatestPostsSection data={{}} isBuilder />);
    await waitFor(() => expect(b.container.textContent).toContain('Could not load'));
  });

  it('view-all link targets blog, category or tag page', async () => {
    mockFetch([post(1)]);
    const va = { enabled: true, text: 'All' };
    const a = render(<BlogLatestPostsSection data={{ show, viewAll: va }} />);
    expect((await a.findByText('All')).getAttribute('href')).toBe('/fa/blog');
    const b = render(<BlogLatestPostsSection data={{ show, viewAll: va, categorySlug: 'a b' }} />);
    await waitFor(() => expect(b.container.querySelector('a[href="/fa/blog/category/a%20b"]')).not.toBeNull());
    const c = render(<BlogLatestPostsSection data={{ show, viewAll: va, tagSlug: 'x' }} />);
    await waitFor(() => expect(c.container.querySelector('a[href="/fa/blog/tag/x"]')).not.toBeNull());
  });

  it('omits view-all when disabled', async () => {
    mockFetch([post(1)]);
    const { findAllByTestId, queryByText } = render(<BlogLatestPostsSection data={{ show, viewAll: { enabled: false, text: 'All' } }} />);
    await findAllByTestId('blog-card');
    expect(queryByText('All')).toBeNull();
  });
});
