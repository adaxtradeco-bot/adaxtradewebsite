import { describe, it, expect, vi } from 'vitest';
import {
  getBlogAlternates,
  isBlogPath,
  resolveBlogSwitchTarget,
  setBlogAlternates,
  subscribeBlogAlternates,
} from '@/components/blog/blog-alternates';

describe('blog language switch target', () => {
  it('uses the sibling post when present', () => {
    expect(resolveBlogSwitchTarget('fa', { en: '/en/blog/a', fa: '/fa/blog/ب' })).toBe('/fa/blog/ب');
  });
  it('falls back to the blog index', () => {
    expect(resolveBlogSwitchTarget('de', { en: '/en/blog/a' })).toBe('/de/blog');
    expect(resolveBlogSwitchTarget('de', null)).toBe('/de/blog');
  });
  it('detects blog paths', () => {
    expect(isBlogPath('/en/blog')).toBe(true);
    expect(isBlogPath('/en/blog/post')).toBe(true);
    expect(isBlogPath('/en/blogger')).toBe(false);
    expect(isBlogPath('/en/about')).toBe(false);
  });
  it('store notifies subscribers', () => {
    const fn = vi.fn();
    const off = subscribeBlogAlternates(fn);
    setBlogAlternates({ en: '/en/blog/a' });
    expect(getBlogAlternates()).toEqual({ en: '/en/blog/a' });
    setBlogAlternates(null);
    off();
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
