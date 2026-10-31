import { describe, it, expect } from 'vitest';
import { readingTime } from '@/lib/blog/reading-time';

const words = (n: number) => Array(n).fill('word').join(' ');

describe('readingTime', () => {
  it('is at least one minute', () => {
    expect(readingTime([], 'en')).toBe(1);
  });

  it('counts words across sections, ignoring HTML tags', () => {
    const sections = [{ data: { html: `<p>${words(300)}</p>` } }, { data: { text: words(150) } }];
    expect(readingTime(sections, 'en')).toBe(3); // 450 / 200
  });

  it('uses a slower rate for fa/ar', () => {
    expect(readingTime([{ data: { html: words(360) } }], 'fa')).toBe(2);
    expect(readingTime([{ data: { html: words(361) } }], 'fa')).toBe(3);
    expect(readingTime([{ data: { html: words(361) } }], 'en')).toBe(2);
  });
});
