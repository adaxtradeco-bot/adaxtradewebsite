import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { BlogLatestPostsPropertyPanel } from '@/components/admin/PageBuilder/BlogLatestPostsPropertyPanel';
import type { SectionConfig } from '@/lib/page-builder/section-schemas';

const api = vi.hoisted(() => ({
  categories: { list: vi.fn() },
  tags: { list: vi.fn() },
}));
vi.mock('@/lib/admin/api', () => ({ blogApi: api }));

const base = {
  title: 'T',
  subtitle: '',
  count: 3,
  categorySlug: '',
  tagSlug: '',
  layout: 'grid',
  columns: 3,
  show: { cover: true, date: true, excerpt: true, author: false, category: true },
  viewAll: { enabled: true, text: 'More' },
};
const section = { id: 'b1', type: 'blog-latest-posts', order: 0, data: base } as unknown as SectionConfig;
const last = (fn: ReturnType<typeof vi.fn>) => fn.mock.calls.at(-1)![0].data;

describe('BlogLatestPostsPropertyPanel', () => {
  beforeEach(() => {
    api.categories.list.mockReset().mockResolvedValue({ categories: [{ slug: 'news', name: 'News' }] });
    api.tags.list.mockReset().mockResolvedValue({ tags: [{ slug: 'ai', name: 'AI' }] });
  });

  it('emits merged data for simple fields', async () => {
    const onUpdate = vi.fn();
    const { getByLabelText } = render(<BlogLatestPostsPropertyPanel section={section} onUpdate={onUpdate} />);
    fireEvent.change(getByLabelText('Title'), { target: { value: 'New' } });
    expect(last(onUpdate)).toEqual({ ...base, title: 'New' });
    fireEvent.change(getByLabelText('Subtitle'), { target: { value: 's' } });
    expect(last(onUpdate).subtitle).toBe('s');
    fireEvent.change(getByLabelText('Number of posts (1-24)'), { target: { value: '50' } });
    expect(last(onUpdate).count).toBe(24);
    fireEvent.change(getByLabelText('Layout'), { target: { value: 'carousel' } });
    expect(last(onUpdate).layout).toBe('carousel');
    fireEvent.change(getByLabelText('Columns (grid)'), { target: { value: '4' } });
    expect(last(onUpdate).columns).toBe(4);
    fireEvent.change(getByLabelText('View all text'), { target: { value: 'Go' } });
    expect(last(onUpdate).viewAll).toEqual({ enabled: true, text: 'Go' });
    fireEvent.click(getByLabelText('Show view all link'));
    expect(last(onUpdate).viewAll.enabled).toBe(false);
    await waitFor(() => expect(api.tags.list).toHaveBeenCalled());
  });

  it('toggles show flags', async () => {
    const onUpdate = vi.fn();
    const { getByLabelText } = render(<BlogLatestPostsPropertyPanel section={section} onUpdate={onUpdate} />);
    fireEvent.click(getByLabelText('show-author'));
    expect(last(onUpdate).show).toEqual({ ...base.show, author: true });
    await waitFor(() => expect(api.categories.list).toHaveBeenCalled());
  });

  it('loads category/tag options for the chosen language and selects them', async () => {
    const onUpdate = vi.fn();
    const { getByLabelText, findByRole } = render(<BlogLatestPostsPropertyPanel section={section} onUpdate={onUpdate} />);
    expect(api.categories.list).toHaveBeenCalledWith('fa');
    await findByRole('option', { name: 'News' });
    fireEvent.change(getByLabelText('Category'), { target: { value: 'news' } });
    expect(last(onUpdate).categorySlug).toBe('news');
    fireEvent.change(getByLabelText('Tag'), { target: { value: 'ai' } });
    expect(last(onUpdate).tagSlug).toBe('ai');
    fireEvent.change(getByLabelText('Filter language'), { target: { value: 'en' } });
    await waitFor(() => expect(api.categories.list).toHaveBeenCalledWith('en'));
  });

  it('falls back to free-text slugs when the fetch fails', async () => {
    api.categories.list.mockRejectedValue(new Error('x'));
    api.tags.list.mockRejectedValue(new Error('x'));
    const onUpdate = vi.fn();
    const { getByLabelText } = render(<BlogLatestPostsPropertyPanel section={section} onUpdate={onUpdate} />);
    await waitFor(() => expect(getByLabelText('Category').tagName).toBe('INPUT'));
    fireEvent.change(getByLabelText('Category'), { target: { value: 'my-cat' } });
    expect(last(onUpdate).categorySlug).toBe('my-cat');
  });
});
