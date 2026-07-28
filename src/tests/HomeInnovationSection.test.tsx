import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';
import HomeInnovationSection, {
  HomeInnovationData,
  InnovationCard,
} from '@/components/builder-sections/HomeInnovationSection';

function mockMatchMedia(overrides: Record<string, boolean> = {}) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: Object.entries(overrides).some(([key, val]) => query.includes(key) && val),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as any;
}

class FakeIntersectionObserver {
  callback: IntersectionObserverCallback;
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }
  observe() {}
  disconnect() {}
  unobserve() {}
}

function makeCard(overrides: Partial<InnovationCard>): InnovationCard {
  return {
    id: 'c1',
    category: 'Category',
    title: 'Title',
    format: 'horizontal',
    mediaType: 'image',
    mediaUrl: 'https://picsum.photos/seed/x/800/600',
    href: '#',
    ...overrides,
  };
}

const baseData: HomeInnovationData = {
  eyebrow: 'Eyebrow',
  headline: 'Headline text',
  supportingCopy: 'Supporting copy',
  sideTitle: 'Side title',
  sideDescription: 'Side description',
  columnCount: 3,
  parallaxIntensity: 20,
  theme: 'dark',
  cards: [
    makeCard({ id: 'c1', column: 0, title: 'Card one' }),
    makeCard({ id: 'c2', column: 1, title: 'Card two' }),
    makeCard({ id: 'c3', column: 0, title: 'Card three' }),
  ],
};

describe('HomeInnovationSection', () => {
  beforeEach(() => {
    mockMatchMedia();
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver as any);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('renders headline/side-title only and omits the card grid when cards is empty (error-handling fallback)', () => {
    const { container, getByText } = render(
      <HomeInnovationSection data={{ ...baseData, cards: [] }} isBuilder />
    );
    expect(container.querySelector('[data-empty-cards="true"]')).toBeTruthy();
    expect(getByText('Headline text')).toBeTruthy();
    expect(getByText('Side title')).toBeTruthy();
  });

  it('assigns cards to columns deterministically for a fixed input (Property 8)', () => {
    const { container } = render(<HomeInnovationSection data={baseData} isBuilder />);
    const desktopGrid = container.querySelector('.md\\:grid') as HTMLElement;
    const columnDivs = desktopGrid.children;
    // column 0 → c1, c3 ; column 1 → c2 ; column 2 → empty
    expect(columnDivs[0].textContent).toContain('Card one');
    expect(columnDivs[0].textContent).toContain('Card three');
    expect(columnDivs[1].textContent).toContain('Card two');
  });

  it('marks external/openInNewTab links with target=_blank + rel=noopener, leaves internal links unmarked (Property 7)', () => {
    const { container } = render(
      <HomeInnovationSection
        data={{
          ...baseData,
          cards: [
            makeCard({ id: 'ext', href: 'https://youtube.com/watch?v=1', column: 0 }),
            makeCard({ id: 'int', href: '/about', column: 1 }),
            makeCard({ id: 'flag', href: '/local', openInNewTab: true, column: 2 }),
          ],
        }}
        isBuilder
      />
    );
    const ext = container.querySelector('a[data-card-id="ext"]');
    const int = container.querySelector('a[data-card-id="int"]');
    const flagged = container.querySelector('a[data-card-id="flag"]');

    expect(ext?.getAttribute('target')).toBe('_blank');
    expect(ext?.getAttribute('rel')).toBe('noopener noreferrer');

    expect(int?.getAttribute('target')).toBeNull();

    expect(flagged?.getAttribute('target')).toBe('_blank');
  });

  it('renders no map layer or pins when locationMap is disabled (Property 13)', () => {
    const { container } = render(
      <HomeInnovationSection
        data={{
          ...baseData,
          cards: [makeCard({ id: 'c1', locationTag: { label: 'USA', x: 20, y: 30 } })],
          locationMap: { enabled: false, mapImageUrl: 'https://example.com/map.svg' },
        }}
        isBuilder
      />
    );
    const mapImg = Array.from(container.querySelectorAll('img')).find((img) => img.src.includes('map.svg'));
    expect(mapImg).toBeUndefined();
  });

  it('renders no map layer or pins when no card has a locationTag (Property 13)', () => {
    const { container } = render(
      <HomeInnovationSection
        data={{
          ...baseData,
          locationMap: { enabled: true, mapImageUrl: 'https://example.com/map.svg' },
        }}
        isBuilder
      />
    );
    const mapImg = Array.from(container.querySelectorAll('img')).find((img) => img.src.includes('map.svg'));
    expect(mapImg).toBeUndefined();
  });

  it('shows the Location_Pin for the hovered card and hides it on hover-out (Property 12)', async () => {
    const { container, queryByText } = render(
      <HomeInnovationSection
        data={{
          ...baseData,
          cards: [
            makeCard({ id: 'c1', column: 0, locationTag: { label: 'USA', x: 20, y: 30 } }),
            makeCard({ id: 'c2', column: 1, locationTag: { label: 'Japan', x: 80, y: 40 } }),
          ],
          locationMap: { enabled: true, mapImageUrl: 'https://example.com/map.svg', pinRevealMode: 'hover' },
        }}
      />
    );

    expect(queryByText('USA')).toBeNull();
    expect(queryByText('Japan')).toBeNull();

    const card1 = container.querySelector('a[data-card-id="c1"]') as HTMLElement;
    fireEvent.mouseEnter(card1);
    expect(queryByText('USA')).toBeTruthy();
    expect(queryByText('Japan')).toBeNull();

    fireEvent.mouseLeave(card1);
    await waitFor(() => expect(queryByText('USA')).toBeNull());
  });

  it('forces muted/loop/playsInline/autoPlay on video cards', () => {
    const { container } = render(
      <HomeInnovationSection
        data={{ ...baseData, cards: [makeCard({ id: 'v1', mediaType: 'video', mediaUrl: 'https://example.com/v.mp4' })] }}
        isBuilder
      />
    );
    const video = container.querySelector('video') as HTMLVideoElement;
    expect(video.muted).toBe(true);
    expect(video.loop).toBe(true);
  });
});
