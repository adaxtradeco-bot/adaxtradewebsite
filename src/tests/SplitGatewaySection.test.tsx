import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import SplitGatewaySection from '@/components/builder-sections/SplitGatewaySection';
import { SECTION_TEMPLATES, getSectionTemplate } from '@/lib/page-builder/section-registry';
import { SectionRenderer } from '@/lib/page-builder/section-renderer';
import { BaseSectionSchema } from '@/lib/page-builder/section-schemas';
import type { SectionConfig } from '@/lib/page-builder/section-schemas';

class FakeObserver {
  observe() {}
  disconnect() {}
  unobserve() {}
}

const data = {
  heading: { title: 'Main line', accentTitle: 'Accent line', signature: 'with us' },
  background: { type: 'video', video: '/media/bg.mp4', poster: '/media/poster.jpg', fixed: true },
  cards: [
    {
      id: 'a',
      title: 'Trade',
      description: 'Trade desc',
      media: { type: 'image', src: '/media/a.jpg', alt: 'A' },
      services: [{ text: 'One', href: '' }, { text: 'Two', href: '/two' }],
      cta: { enabled: true, text: 'Enter trade', href: '/fa/trade', openInNewTab: false, showArrow: true },
    },
    {
      id: 'b',
      title: 'Solar',
      description: 'Solar desc',
      media: { type: 'video', src: '/media/b.mp4', poster: '/media/b.jpg' },
      services: [],
      cta: { enabled: false, text: 'Hidden', href: '#', openInNewTab: false, showArrow: true },
    },
  ],
  motion: { ctaHover: 'fill', cardHover: 'glow', mediaHover: 'grayscale' },
  services: { showNumbers: false },
};

describe('SplitGatewaySection', () => {
  beforeEach(() => {
    vi.stubGlobal('IntersectionObserver', FakeObserver as any);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders heading lines, cards, services and CTA links', () => {
    const { container, getByText } = render(<SplitGatewaySection data={data} />);
    expect(container.querySelector('h1')?.textContent).toBe('Main lineAccent line');
    expect(getByText('with us')).toBeTruthy();
    expect(container.querySelectorAll('article.sg-card')).toHaveLength(2);
    const cta = container.querySelector('a.sg-cta') as HTMLAnchorElement;
    expect(cta.getAttribute('href')).toBe('/fa/trade');
    expect(container.querySelectorAll('a.sg-cta')).toHaveLength(1); // second card has the button disabled
    expect(container.querySelector('.sg-svc a')?.getAttribute('href')).toBe('/two');
  });

  it('renders images and videos in card media and a video background', () => {
    const { container } = render(<SplitGatewaySection data={data} />);
    expect(container.querySelector('.sg-media img')?.getAttribute('src')).toBe('/media/a.jpg');
    const cardVideo = container.querySelector('.sg-media video') as HTMLVideoElement;
    expect(cardVideo.getAttribute('src')).toBe('/media/b.mp4');
    expect(cardVideo.getAttribute('poster')).toBe('/media/b.jpg');
    expect(container.querySelector('.sg-bg video')?.getAttribute('src')).toBe('/media/bg.mp4');
  });

  it('hides empty pieces: no numbers by default, no badge, no media slot when type is none', () => {
    const { container } = render(
      <SplitGatewaySection data={{ cards: [{ title: 'X', media: { type: 'none', src: '/a.jpg' }, services: ['s'] }] }} />,
    );
    expect(container.querySelector('.sg-svc-n')).toBeNull();
    expect(container.querySelector('.sg-badge')).toBeNull();
    expect(container.querySelector('.sg-media')).toBeNull();
  });

  it('shows service numbers only when enabled', () => {
    const { container } = render(
      <SplitGatewaySection data={{ services: { showNumbers: true }, cards: [{ title: 'X', services: ['a', 'b'] }] }} />,
    );
    expect(Array.from(container.querySelectorAll('.sg-svc-n')).map((e) => e.textContent)).toEqual(['01', '02']);
  });

  it('puts hover colours in the stylesheet, not inline, so they can win on hover', () => {
    const { container } = render(<SplitGatewaySection data={data} />);
    const css = container.querySelector('style')!.innerHTML;
    expect(css).toContain('.sg-card:hover .sg-cta{background-color:var(--sg-cta-hbg);color:var(--sg-cta-hcolor)');
    expect(css).toContain('grayscale(0)');
    expect(css).toContain('box-shadow:0 0 0 1px var(--sg-accent)');
    const cta = container.querySelector('a.sg-cta') as HTMLElement;
    expect(cta.getAttribute('style')).toBeNull();
  });

  it('applies the fixed background only on the live page, not in the builder', () => {
    const live = render(<SplitGatewaySection data={data} />);
    expect(live.container.querySelector('style')!.innerHTML).toContain('position:fixed');
    live.unmount();
    const builder = render(<SplitGatewaySection data={data} isBuilder />);
    expect(builder.container.querySelector('style')!.innerHTML).not.toContain('position:fixed');
  });

  it('scopes its stylesheet per instance', () => {
    const { container } = render(
      <>
        <SplitGatewaySection data={data} />
        <SplitGatewaySection data={data} />
      </>,
    );
    const scopes = Array.from(container.querySelectorAll('section')).map((s) => Array.from(s.classList).find((c) => c.startsWith('sg-')));
    expect(new Set(scopes).size).toBe(2);
  });
});

describe('SplitGatewaySection spacing and screen fill', () => {
  beforeEach(() => {
    vi.stubGlobal('IntersectionObserver', FakeObserver as any);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });
  const css = (props: any, builder = false) => {
    const { container } = render(<SplitGatewaySection data={props} isBuilder={builder} />);
    return container.querySelector('style')!.innerHTML;
  };

  it('uses layout padding as the only vertical padding (64px default, not the style class)', () => {
    const { container } = render(<SplitGatewaySection data={{}} style={{ padding: 'py-32' }} />);
    expect(container.querySelector('section')!.className).not.toContain('py-32');
    expect(container.querySelector('style')!.innerHTML).toContain('padding-top:64px;padding-bottom:64px');
  });

  it('never lets the padding drop below 24px, and shrinks it on mobile', () => {
    const out = css({ layout: { paddingTop: 0, paddingBottom: 4 } });
    expect(out).toContain('padding-top:24px;padding-bottom:24px');
    const big = css({ layout: { paddingTop: 200, paddingBottom: 200 } });
    expect(big).toContain('padding-top:200px;padding-bottom:200px');
    expect(big).toContain('padding-top:48px;padding-bottom:48px'); // mobile cap
  });

  it('fill screen is only a minimum height (header subtracted) and keeps the cards uncut', () => {
    const out = css({ layout: { fillScreen: true, headerHeight: 120, verticalAlign: 'center' } });
    expect(out).toContain('min-height:calc(100svh - var(--site-header-h, 120px))');
    expect(out).toContain('min-height:calc(100vh - var(--site-header-h, 120px))');
    expect(out).toContain('justify-content:center');
    expect(out).not.toMatch(/\sheight:calc\(100/);
    expect(out).not.toContain('max-height');
  });

  it('uses the fixed minHeight when fill screen is off, and ignores fill screen inside the builder', () => {
    expect(css({ layout: { fillScreen: false, minHeight: 500 } })).toContain('min-height:500px');
    expect(css({ layout: { fillScreen: true, minHeight: 500 } }, true)).toContain('min-height:500px');
  });

  it('applies the configurable line heights and gaps', () => {
    const out = css({
      heading: { lineHeight: 1.8, signatureGap: 40 },
      typography: { titleLineHeight: 1.6 },
      spacing: { mediaGap: 36, badgeGap: 6, titleGap: 14, descGap: 30, servicesGap: 18 },
    });
    expect(out).toContain('line-height:1.8');
    expect(out).toContain('.sg-signature{margin-top:40px');
    expect(out).toContain('margin:0 0 14px;font-size:34px;line-height:1.6');
    expect(out).toContain('.sg-desc{margin:0 0 30px');
    expect(out).toContain('.sg-svcs{margin:0 0 18px');
    expect(out).toContain('padding:36px 18px 12px');
  });
});

describe('split-gateway registration', () => {
  it('is in the registry once, accepted by the schema, and rendered by SectionRenderer', () => {
    expect(SECTION_TEMPLATES.filter((t) => t.type === 'split-gateway')).toHaveLength(1);
    const tpl = getSectionTemplate('split-gateway')!;
    expect(BaseSectionSchema.safeParse({ ...tpl.defaultData, id: 'sg-1' }).success).toBe(true);
    vi.stubGlobal('IntersectionObserver', FakeObserver as any);
    const section = { ...tpl.defaultData, id: 'sg-1' } as SectionConfig;
    const live = render(<SectionRenderer section={section} />);
    expect(live.container.querySelectorAll('article.sg-card')).toHaveLength(2);
    live.unmount();
    const builder = render(<SectionRenderer section={section} isBuilder />);
    expect(builder.container.querySelectorAll('article.sg-card')).toHaveLength(2);
    vi.unstubAllGlobals();
  });
});
