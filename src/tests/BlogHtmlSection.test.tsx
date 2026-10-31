import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import BlogHtmlSection from '@/components/builder-sections/BlogHtmlSection';

describe('BlogHtmlSection', () => {
  it('renders sanitized html and keeps dir attributes', () => {
    const html = '<p dir="rtl" onclick="x()">سلام</p><script>alert(1)</script><a href="javascript:alert(1)">bad</a>';
    const { container } = render(<BlogHtmlSection data={{ html }} />);
    const prose = container.querySelector('.blog-prose')!;
    expect(prose.querySelector('script')).toBeNull();
    expect(prose.innerHTML).not.toContain('onclick');
    expect(prose.innerHTML).not.toContain('javascript:');
    expect(prose.querySelector('p')!.getAttribute('dir')).toBe('rtl');
    expect(prose.textContent).toContain('سلام');
  });
});
