import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import BlogHeadingSection from '@/components/builder-sections/BlogHeadingSection';

describe('BlogHeadingSection', () => {
  it('renders the chosen tag, explicit anchor and alignment', () => {
    const { container } = render(<BlogHeadingSection data={{ text: 'Intro', level: 'h3', anchor: 'start-here', align: 'center' }} />);
    const h = container.querySelector('h3')!;
    expect(h.textContent).toBe('Intro');
    expect(h.id).toBe('start-here');
    expect(h.className).toContain('text-center');
  });

  it('derives the anchor from the text and never renders h1', () => {
    const { container } = render(<BlogHeadingSection data={{ text: 'Hello World', level: 'h1', align: 'end' }} />);
    expect(container.querySelector('h1')).toBeNull();
    const h = container.querySelector('h2')!;
    expect(h.id).toBe('hello-world');
    expect(h.className).toContain('text-end');
  });
});
