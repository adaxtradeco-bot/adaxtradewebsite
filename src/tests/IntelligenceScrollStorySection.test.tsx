import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';
import IntelligenceScrollStorySection from '@/components/builder-sections/IntelligenceScrollStorySection';
import { INTELLIGENCE_SCROLL_STORY_TEMPLATES } from '@/lib/page-builder/section-templates/intelligence-scroll-story';

const templateData = INTELLIGENCE_SCROLL_STORY_TEMPLATES[0].defaultData.data as any;

function mockMatchMedia(reduced: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes('reduce') ? reduced : false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as any;
}

class FakeObserver {
  observe() {}
  disconnect() {}
  unobserve() {}
}

describe('IntelligenceScrollStorySection', () => {
  beforeEach(() => {
    mockMatchMedia(false);
    vi.stubGlobal('IntersectionObserver', FakeObserver as any);
    vi.stubGlobal('ResizeObserver', FakeObserver as any);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('renders every chapter: one image + one article each, with the seed copy', () => {
    const { container, getByText } = render(<IntelligenceScrollStorySection data={templateData} isBuilder />);
    expect(container.querySelectorAll('img')).toHaveLength(3);
    expect(container.querySelectorAll('article')).toHaveLength(3);
    expect(getByText('BUILT IN. NOT BOLTED ON.')).toBeTruthy();
    expect(getByText('No approval. No action.')).toBeTruthy();
    expect(getByText('PEOPLE FIRST. ALWAYS.')).toBeTruthy();
  });

  it('only the first chapter is exposed to assistive tech; the others are aria-hidden and inert', () => {
    const { container } = render(<IntelligenceScrollStorySection data={templateData} isBuilder />);
    const articles = Array.from(container.querySelectorAll('article'));
    expect(articles[0].getAttribute('aria-hidden')).toBe('false');
    expect(articles[0].hasAttribute('inert')).toBe(false);
    expect(articles[1].getAttribute('aria-hidden')).toBe('true');
    expect(articles[1].hasAttribute('inert')).toBe(true);
    expect(articles[2].getAttribute('aria-hidden')).toBe('true');
  });

  it('navigation exposes aria-label and aria-pressed per chapter', () => {
    const { getByRole } = render(<IntelligenceScrollStorySection data={templateData} isBuilder />);
    expect(getByRole('button', { name: 'Your agency' }).getAttribute('aria-pressed')).toBe('true');
    expect(getByRole('button', { name: 'Your trust' }).getAttribute('aria-pressed')).toBe('false');
    expect(getByRole('navigation', { name: 'Value chapters' })).toBeTruthy();
  });

  it('builder preview: clicking a nav button moves the story to that chapter', async () => {
    const { container, getByRole } = render(<IntelligenceScrollStorySection data={templateData} isBuilder />);
    fireEvent.click(getByRole('button', { name: 'Your potential' }));

    await waitFor(
      () => {
        expect(getByRole('button', { name: 'Your potential' }).getAttribute('aria-pressed')).toBe('true');
      },
      { timeout: 4000 }
    );
    const articles = Array.from(container.querySelectorAll('article'));
    expect(articles[2].getAttribute('aria-hidden')).toBe('false');
    expect(articles[0].getAttribute('aria-hidden')).toBe('true');
  });

  it('live mode sizes the scroll track from the chapter count', () => {
    const { container } = render(<IntelligenceScrollStorySection data={templateData} />);
    const root = container.querySelector('section') as HTMLElement;
    expect(root.style.height).toBe('calc(340svh)');
  });

  it('renders as many chapters as configured and grows the track', () => {
    const chapters = Array.from({ length: 5 }, (_, i) => ({
      ...templateData.chapters[0],
      id: `c${i}`,
      name: `Chapter ${i + 1}`,
    }));
    const { container } = render(<IntelligenceScrollStorySection data={{ ...templateData, chapters }} />);
    expect(container.querySelectorAll('article')).toHaveLength(5);
    expect(container.querySelectorAll('.iss-nav-btn')).toHaveLength(5);
    expect((container.querySelector('section') as HTMLElement).style.height).toBe('calc(500svh)');
  });

  it('honours the disable switches (overline, navigation, direction, progress)', () => {
    const { container, queryByText } = render(
      <IntelligenceScrollStorySection
        isBuilder
        data={{
          ...templateData,
          overline: { ...templateData.overline, enabled: false },
          navigation: { ...templateData.navigation, enabled: false },
          direction: { ...templateData.direction, enabled: false },
          progress: { enabled: false, height: 4 },
        }}
      />
    );
    expect(queryByText('BUILT IN. NOT BOLTED ON.')).toBeNull();
    expect(container.querySelector('nav')).toBeNull();
    expect(queryByText('PEOPLE FIRST. ALWAYS.')).toBeNull();
    expect(container.querySelector('.iss-progress')).toBeNull();
  });

  it('shows a placeholder instead of a broken <img> for a chapter without an image', () => {
    const chapters = [{ ...templateData.chapters[0], image: { src: '', alt: '' } }];
    const { container } = render(<IntelligenceScrollStorySection data={{ ...templateData, chapters }} isBuilder />);
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('.iss-placeholder')).toBeTruthy();
  });

  it('shows an empty-state prompt (and does not crash) with zero chapters', () => {
    const { getByText } = render(<IntelligenceScrollStorySection data={{ ...templateData, chapters: [] }} isBuilder />);
    expect(getByText('Add a chapter to start the story.')).toBeTruthy();
  });

  it('survives missing / malformed data', () => {
    expect(() => render(<IntelligenceScrollStorySection data={undefined as any} isBuilder />)).not.toThrow();
    expect(() => render(<IntelligenceScrollStorySection data={{ chapters: 'nope' } as any} isBuilder />)).not.toThrow();
  });

  it('renders proof icons from Lucide names and Font Awesome configs', () => {
    const chapters = [
      { ...templateData.chapters[0], proof: { enabled: true, icon: 'shield-check', text: 'Lucide' } },
      { ...templateData.chapters[1], proof: { enabled: true, icon: { name: 'bolt', type: 'solid', size: 'lg' }, text: 'FA' } },
    ];
    const { container } = render(<IntelligenceScrollStorySection data={{ ...templateData, chapters }} isBuilder />);
    expect(container.querySelector('.iss-proof svg')).toBeTruthy();
    expect(container.querySelector('.iss-proof i.fas.fa-bolt')).toBeTruthy();
  });

  it('opens CTA links in a new tab safely when asked', () => {
    const chapters = [
      {
        ...templateData.chapters[0],
        cta: { enabled: true, text: 'Go', href: 'https://example.com', openInNewTab: true },
      },
    ];
    const { getByText } = render(<IntelligenceScrollStorySection data={{ ...templateData, chapters }} isBuilder />);
    const link = getByText('Go').closest('a') as HTMLAnchorElement;
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('applies colour overrides and copy side as CSS variables / data attributes', () => {
    const { container } = render(
      <IntelligenceScrollStorySection
        isBuilder
        data={{
          ...templateData,
          colors: { theme: 'dark', accent: '#00aa88' },
          layout: { ...templateData.layout, copyPosition: 'end', titleSize: 60 },
        }}
      />
    );
    const root = container.querySelector('section') as HTMLElement;
    expect(root.getAttribute('data-theme')).toBe('dark');
    expect(root.getAttribute('data-copy')).toBe('end');
    expect(root.style.getPropertyValue('--iss-accent')).toBe('#00aa88');
    expect(root.style.getPropertyValue('--iss-title')).toBe('60px');
  });

  it('prefers-reduced-motion swaps to the plain stacked layout (all chapters readable, no pinned stage)', async () => {
    mockMatchMedia(true);
    const { container } = render(<IntelligenceScrollStorySection data={templateData} />);
    await waitFor(() => expect(container.querySelector('.iss-static-list')).toBeTruthy());
    expect(container.querySelector('.iss-stage')).toBeNull();
    const articles = Array.from(container.querySelectorAll('article'));
    expect(articles).toHaveLength(3);
    articles.forEach((a) => expect(a.hasAttribute('aria-hidden')).toBe(false));
  });

  it('keeps the animated stage when the editor opts out of the reduced-motion fallback', () => {
    mockMatchMedia(true);
    const { container } = render(
      <IntelligenceScrollStorySection
        data={{ ...templateData, motion: { ...templateData.motion, respectReducedMotion: false } }}
      />
    );
    expect(container.querySelector('.iss-static-list')).toBeNull();
    expect(container.querySelector('.iss-stage')).toBeTruthy();
  });
});
