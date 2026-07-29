import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
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

  it('keeps the background media visible behind the brand when opening.backgroundOpacity < 1', () => {
    const { container } = render(
      <HomeCoverSection
        data={{
          ...baseData,
          opening: {
            enabled: true,
            logoUrl: 'https://picsum.photos/seed/logo/200/200',
            logoAlt: 'Brand logo',
            backgroundColor: '#fafafa',
            backgroundOpacity: 0.55,
          },
        }}
      />
    );
    const logoImg = container.querySelector('img[alt="Brand logo"]') as HTMLElement;
    const panel = logoImg.parentElement as HTMLElement;
    const backdrop = panel.querySelector('div') as HTMLElement;

    // The backdrop carries the translucency, so media shows through...
    expect(backdrop.style.opacity).toBe('0.55');
    expect(backdrop.style.backgroundColor).toBe('rgb(250, 250, 250)');
    // ...while the logo itself is never dimmed by it.
    expect(logoImg.style.opacity).toBe('');
  });

  it('renders a full-bleed opening backdrop image when opening.backgroundImageUrl is set', () => {
    const { container } = render(
      <HomeCoverSection
        data={{
          ...baseData,
          opening: {
            enabled: true,
            logoUrl: 'https://picsum.photos/seed/logo/200/200',
            logoAlt: 'Brand logo',
            backgroundColor: '#fafafa',
            backgroundImageUrl: 'https://picsum.photos/seed/opening-bg/1600/900',
          },
        }}
      />
    );
    const logoImg = container.querySelector('img[alt="Brand logo"]') as HTMLElement;
    const panel = logoImg.parentElement as HTMLElement;
    const backdrop = panel.querySelector('div') as HTMLElement;
    const backdropImg = backdrop.querySelector('img') as HTMLImageElement;

    expect(backdropImg).toBeTruthy();
    expect(backdropImg.src).toContain('opening-bg');
    expect(backdropImg.className).toContain('object-cover');
    // The image lives inside the same backdrop div, so backgroundOpacity dims it too, never the logo.
    expect(backdropImg).not.toBe(logoImg);
  });

  it('omits the opening backdrop image when opening.backgroundImageUrl is unset', () => {
    const { container } = render(
      <HomeCoverSection
        data={{
          ...baseData,
          opening: { enabled: true, logoUrl: 'https://picsum.photos/seed/logo/200/200', logoAlt: 'Brand logo' },
        }}
      />
    );
    const logoImg = container.querySelector('img[alt="Brand logo"]') as HTMLElement;
    const panel = logoImg.parentElement as HTMLElement;
    const backdrop = panel.querySelector('div') as HTMLElement;
    expect(backdrop.querySelector('img')).toBeNull();
  });

  it('defaults the opening backdrop to fully solid when backgroundOpacity is unset', () => {
    const { container } = render(
      <HomeCoverSection
        data={{
          ...baseData,
          opening: { enabled: true, logoUrl: 'https://picsum.photos/seed/logo/200/200', logoAlt: 'Brand logo' },
        }}
      />
    );
    const panel = (container.querySelector('img[alt="Brand logo"]') as HTMLElement).parentElement!;
    expect((panel.querySelector('div') as HTMLElement).style.opacity).toBe('1');
  });

  it('holds the poster on top and does not autoplay when videoStartMode is "after-poster"', () => {
    const { container } = render(
      <HomeCoverSection
        data={{
          ...baseData,
          mediaType: 'video',
          videoUrl: 'https://example.com/v.mp4',
          posterImageDesktop: 'https://picsum.photos/seed/poster/1600/900',
          videoStartMode: 'after-poster',
          videoStartDelayMs: 1800,
        }}
      />
    );
    const video = container.querySelector('video') as HTMLVideoElement;
    const posterOverlay = container.querySelector('img[aria-hidden]') as HTMLElement;

    expect(video.getAttribute('autoplay')).toBeNull();
    expect(posterOverlay).toBeTruthy();
    expect(posterOverlay.style.opacity).toBe('1');
    // muted must still be forced, since the timer will start playback programmatically
    expect(video.muted).toBe(true);
  });

  it('cross-fades the poster away once the start timer fires', async () => {
    // jsdom has no real media pipeline; `play()` throws "Not implemented" there.
    const playSpy = vi
      .spyOn(HTMLMediaElement.prototype, 'play')
      .mockImplementation(() => Promise.resolve());
    vi.useFakeTimers();
    try {
      const { container } = render(
        <HomeCoverSection
          data={{
            ...baseData,
            mediaType: 'video',
            videoUrl: 'https://example.com/v.mp4',
            posterImageDesktop: 'https://picsum.photos/seed/poster/1600/900',
            videoStartMode: 'after-poster',
            videoStartDelayMs: 1800,
          }}
        />
      );
      expect((container.querySelector('img[aria-hidden]') as HTMLElement).style.opacity).toBe('1');

      await act(async () => {
        vi.advanceTimersByTime(1900);
      });

      expect((container.querySelector('img[aria-hidden]') as HTMLElement).style.opacity).toBe('0');
      expect(playSpy).toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
      playSpy.mockRestore();
    }
  });

  it('does not crash when video.play() returns undefined instead of a promise (older engines)', async () => {
    const playSpy = vi
      .spyOn(HTMLMediaElement.prototype, 'play')
      .mockImplementation(() => undefined as unknown as Promise<void>);
    vi.useFakeTimers();
    try {
      render(
        <HomeCoverSection
          data={{
            ...baseData,
            mediaType: 'video',
            videoUrl: 'https://example.com/v.mp4',
            posterImageDesktop: 'https://picsum.photos/seed/poster/1600/900',
            videoStartMode: 'after-poster',
            videoStartDelayMs: 100,
          }}
        />
      );
      await act(async () => {
        expect(() => vi.advanceTimersByTime(200)).not.toThrow();
      });
    } finally {
      vi.useRealTimers();
      playSpy.mockRestore();
    }
  });

  it('renders no poster overlay and keeps native autoplay in the default "immediate" mode', () => {
    const { container } = render(
      <HomeCoverSection
        data={{
          ...baseData,
          mediaType: 'video',
          videoUrl: 'https://example.com/v.mp4',
          posterImageDesktop: 'https://picsum.photos/seed/poster/1600/900',
        }}
      />
    );
    expect(container.querySelector('img[aria-hidden]')).toBeNull();
    expect(container.querySelector('video')?.getAttribute('autoplay')).not.toBeNull();
  });

  it('renders tagline, body lines, and CTA', () => {
    const { getByText } = render(<HomeCoverSection data={baseData} isBuilder />);
    expect(getByText(baseData.tagline)).toBeTruthy();
    expect(getByText('Line one')).toBeTruthy();
    expect(getByText('Line two')).toBeTruthy();
    expect(getByText('Discover more')).toBeTruthy();
  });
});
