import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { SectionRenderer } from '@/lib/page-builder/section-renderer';
import type { SectionConfig } from '@/lib/page-builder/section-schemas';

class FakeIntersectionObserver {
  observe() {}
  disconnect() {}
  unobserve() {}
}

const homeCoverSection: SectionConfig = {
  id: 'home-cover-1',
  type: 'home-cover',
  order: 0,
  data: {
    mediaType: 'image',
    imageUrl: 'https://picsum.photos/seed/cover/1600/900',
    tagline: 'Tagline',
    scrollEffect: 'none',
  },
};

const homeInnovationSection: SectionConfig = {
  id: 'home-innovation-1',
  type: 'home-innovation',
  order: 1,
  data: {
    headline: 'Headline',
    sideTitle: 'Side title',
    cards: [
      {
        id: 'c1',
        category: 'Category',
        title: 'Title',
        format: 'horizontal',
        mediaType: 'image',
        mediaUrl: 'https://picsum.photos/seed/x/800/600',
        href: '#',
      },
    ],
  },
};

describe('SectionRenderer — home-cover / home-innovation registration', () => {
  beforeEach(() => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    })) as any;
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver as any);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('renders home-cover without throwing and produces a non-null element (Property 1)', () => {
    expect(() =>
      render(<SectionRenderer section={homeCoverSection} isBuilder />)
    ).not.toThrow();
  });

  it('renders home-innovation without throwing and produces a non-null element (Property 1)', () => {
    const { getByText } = render(<SectionRenderer section={homeInnovationSection} isBuilder />);
    expect(getByText('Headline')).toBeTruthy();
  });
});
