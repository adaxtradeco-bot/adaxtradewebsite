import { describe, it, expect } from 'vitest';
import { slugify, uniqueSlug } from '@/lib/blog/slug';

describe('slugify', () => {
  it('lowercases and joins words', () => {
    expect(slugify('  Hello,  World! 2026 ')).toBe('hello-world-2026');
  });

  it('keeps Persian letters and digits, treating ZWNJ as a break', () => {
    expect(slugify('۵ نکته برای واردات از ترکیه')).toBe('۵-نکته-برای-واردات-از-ترکیه');
    expect(slugify('می‌خواهم')).toBe('می-خواهم');
  });

  it('returns empty for symbols only', () => {
    expect(slugify('!!!')).toBe('');
  });
});

describe('uniqueSlug', () => {
  const clientWith = (taken: string[]) =>
    ({ post: { findUnique: async ({ where }: any) => (taken.includes(where.language_slug.slug) ? { id: 'x' } : null) } }) as any;

  it('returns the base when free', async () => {
    expect(await uniqueSlug('en', 'My Post', clientWith([]))).toBe('my-post');
  });

  it('adds a numeric suffix on collision', async () => {
    expect(await uniqueSlug('en', 'My Post', clientWith(['my-post', 'my-post-2']))).toBe('my-post-3');
  });

  it('falls back to "post" for an empty slug', async () => {
    expect(await uniqueSlug('en', '???', clientWith([]))).toBe('post');
  });
});
