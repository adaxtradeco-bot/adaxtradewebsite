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
