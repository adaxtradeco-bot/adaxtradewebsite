import { describe, it, expect } from 'vitest';
import { sanitizeHtml, sanitizeSections } from '@/lib/blog/sanitize';

describe('sanitizeHtml', () => {
  it('removes script and style tags', () => {
    const out = sanitizeHtml('<p>hi</p><script>alert(1)</script><style>p{}</style>');
    expect(out).toBe('<p>hi</p>');
  });

  it('removes on* attributes and javascript: URLs', () => {
    const out = sanitizeHtml('<a href="javascript:alert(1)" onclick="x()">a</a><img src="x" onerror="y()">');
    expect(out).not.toMatch(/onclick|onerror|javascript:/i);
  });

  it('keeps allowed iframe hosts only', () => {
    expect(sanitizeHtml('<iframe src="https://www.youtube.com/embed/abc"></iframe>')).toContain('youtube.com');
    expect(sanitizeHtml('<iframe src="https://evil.example/x"></iframe>')).not.toContain('iframe');
  });

  it('forces rel on target=_blank links', () => {
    expect(sanitizeHtml('<a href="https://a.test" target="_blank">x</a>')).toContain('rel="noopener noreferrer"');
  });

  it('keeps Persian text and dir attribute, and is idempotent', () => {
    const once = sanitizeHtml('<p dir="rtl">سلام <strong>دنیا</strong></p>');
    expect(once).toBe('<p dir="rtl">سلام <strong>دنیا</strong></p>');
    expect(sanitizeHtml(once)).toBe(once);
  });
});

describe('sanitizeSections', () => {
  it('cleans only blog HTML sections', () => {
    const out = sanitizeSections([
      { type: 'blog-html', data: { html: '<script>x</script><p>a</p>' } },
      { type: 'blog-rich-text', data: { html: '<p onclick="x">b</p>' } },
      { type: 'hero', data: { html: '<script>keep</script>' } },
    ]);
    expect(out[0].data!.html).toBe('<p>a</p>');
    expect(out[1].data!.html).toBe('<p>b</p>');
    expect(out[2].data!.html).toContain('script');
  });
});
