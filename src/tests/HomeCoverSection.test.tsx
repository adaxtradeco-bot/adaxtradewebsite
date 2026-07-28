import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import HomeCoverSection, { HomeCoverData } from '@/components/builder-sections/HomeCoverSection';

function mockMatchMedia(reduced: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes('reduce') ? reduced : false,
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
  observe() {
    this.callback([{ isIntersecting: true } as IntersectionObserverEntry], this as any);
  }
  disconnect() {}
  unobserve() {}
}

const baseData: HomeCoverData = {
  mediaType: 'image',
  imageUrl: 'https://picsum.photos/seed/cover/1600/900',
  tagline: 'Every idea, one connected direction.',
  body: 'Line one\nLine two',
  cta: { text: 'Discover more', href: '#', enabled: true },
  theme: 'dark',
  showScrollCue: true,
  scrollEffect: 'none',
};

describe('HomeCoverSection', () => {
  beforeEach(() => {
    mockMatchMedia(false);
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver as any);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('renders an <img> and no <video> when mediaType is "image" (Property 2)', () => {
    const { container } = render(<HomeCoverSection data={{ ...baseData, mediaType: 'image' }} isBuilder />);
    expect(container.querySelector('img')).toBeTruthy();
    expect(container.querySelector('video')).toBeNull();
  });

  it('renders a <video> with a poster and no bare <img> media layer when mediaType is "video" (Property 2)', () => {
    const { container } = render(
      <HomeCoverSection
        data={{
          ...baseData,
          mediaType: 'video',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          posterImageDesktop: 'https://picsum.photos/seed/poster/1600/900',
          opening: { enabled: false },
          cta: { text: '', href: '', enabled: false },
        }}
        isBuilder
      />
    );
    const video = container.querySelector('video');
    expect(video).toBeTruthy();
    expect(video?.getAttribute('poster')).toBe('https://picsum.photos/seed/poster/1600/900');
    expect(container.querySelector('img')).toBeNull();
  });

  it('forces muted=true whenever autoplay is true, regardless of stored videoMuted (Property 3)', () => {
    const { container } = render(
      <HomeCoverSection
        data={{
          ...baseData,
          mediaType: 'video',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          videoAutoplay: true,
          videoMuted: false,
        }}
        isBuilder
      />
    );
    const video = container.querySelector('video') as HTMLVideoElement;
    expect(video.muted).toBe(true);
  });

  it('falls back to a solid background with no broken visual state when all media URLs are empty', () => {
    const { container } = render(
      <HomeCoverSection data={{ ...baseData, mediaType: 'video', imageUrl: undefined, videoUrl: undefined }} isBuilder />
    );
    expect(container.querySelector('video')).toBeNull();
    expect(container.querySelector('img')).toBeNull();
  });

  it('applies no scroll-linked transform when scrollEffect is "none" (Property 5)', () => {
    const { container } = render(<HomeCoverSection data={{ ...baseData, scrollEffect: 'none' }} />);
    const section = container.querySelector('[data-scroll-effect="none"]');
    expect(section).toBeTruthy();
    const mediaLayer = section?.querySelector('div > div');
    // No `transform`/`y` should be applied to the media layer in 'none' mode.
    expect((mediaLayer as HTMLElement)?.style.transform).toBeFalsy();
  });

  it('settles to the final state immediately under reduced motion (Property 4)', () => {
    mockMatchMedia(true);
    const { container } = render(
      <HomeCoverSection
        data={{
          ...baseData,
          scrollEffect: 'pin-reveal',
          opening: { enabled: true, logoUrl: 'https://picsum.photos/seed/logo/200/200', logoAlt: 'Brand logo' },
        }}
      />
    );
    const logoImg = container.querySelector('img[alt="Brand logo"]');
    const openingPanel = logoImg?.parentElement;
    // Under reduced motion the opening panel must already be hidden (opacity 0).
    expect(openingPanel?.style.opacity).toBe('0');
  });

  it('renders tagline, body lines, and CTA', () => {
    const { getByText } = render(<HomeCoverSection data={baseData} isBuilder />);
    expect(getByText(baseData.tagline)).toBeTruthy();
    expect(getByText('Line one')).toBeTruthy();
    expect(getByText('Line two')).toBeTruthy();
    expect(getByText('Discover more')).toBeTruthy();
  });
});
