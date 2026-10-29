import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import ProjectHeroSection from '@/components/builder-sections/ProjectHeroSection';
import { SECTION_TEMPLATES, getSectionTemplate } from '@/lib/page-builder/section-registry';
import { SectionRenderer } from '@/lib/page-builder/section-renderer';
import { BaseSectionSchema } from '@/lib/page-builder/section-schemas';
import type { SectionConfig } from '@/lib/page-builder/section-schemas';
import {
  normalizeProjectHeroData,
  buildScrimCss,
  resolveItemVisual,
  DEFAULT_PROJECT_HERO_BACKGROUND,
} from '@/lib/page-builder/project-hero';

class FakeObserver {
  observe() {}
  disconnect() {}
  unobserve() {}
}

const data = {
  background: { type: 'image', image: '/media/bg.jpg' },
  content: {
    title: 'Line one\nLine two',
    tagline: 'Tagline',
    description: 'Paragraph',
    buttons: [
      { text: 'Primary', href: '#a', variant: 'solid' },
      { text: 'Secondary', href: '#b', variant: 'outline' },
    ],
  },
  picker: {
    title: 'Pick one',
    items: [
      { title: 'Home', badge: 'kW', description: 'Home desc', href: '#home', media: { type: 'icon', icon: 'home' } },
      { title: 'Plant', badge: 'MW', description: 'Plant desc', href: '#plant', media: { type: 'image', src: '/media/p.jpg', alt: 'Plant' } },
    ],
  },
};

describe('project-hero logic', () => {
  it('normalizes an empty object to a complete, render-safe model', () => {
    const d = normalizeProjectHeroData({});
    expect(d.picker.items).toEqual([]);
    expect(d.content.buttons).toEqual([]);
    expect(d.background.overlay.direction).toBe('start');
    expect(d.layout.maxWidth).toBeGreaterThan(0);
  });

  it('fills ids and per-item media defaults', () => {
    const d = normalizeProjectHeroData(data);
    expect(d.picker.items.map((i) => i.id)).toEqual(['item-1', 'item-2']);
    expect(d.picker.items[0].media.fit).toBe('cover');
    expect(d.content.buttons.map((b) => b.id)).toEqual(['button-1', 'button-2']);
  });

  it('resolves the thumbnail visual', () => {
    expect(resolveItemVisual({ type: 'image', src: '/a.jpg', icon: 'home' })).toBe('image');
    expect(resolveItemVisual({ type: 'image', src: '', icon: 'home' })).toBe('icon');
    expect(resolveItemVisual({ type: 'none', src: '/a.jpg', icon: 'home' })).toBe('none');
  });

  it('builds a direction-aware scrim', () => {
    const o = DEFAULT_PROJECT_HERO_BACKGROUND.overlay;
    expect(buildScrimCss(o, 'rtl')).toContain('to left');
    expect(buildScrimCss(o, 'ltr')).toContain('to right');
    expect(buildScrimCss({ ...o, direction: 'end' }, 'rtl')).toContain('to right');
    expect(buildScrimCss({ ...o, direction: 'top' }, 'ltr')).toContain('to bottom');
    expect(buildScrimCss({ ...o, direction: 'uniform' }, 'ltr')).not.toContain('to ');
  });
});

describe('ProjectHeroSection', () => {
  beforeEach(() => {
    vi.stubGlobal('IntersectionObserver', FakeObserver as any);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the text column, buttons and picker rows with their own links', () => {
    const { container, getByText } = render(<ProjectHeroSection data={data} />);
    expect(container.querySelector('h1')?.textContent).toContain('Line one');
    expect(getByText('Tagline')).toBeTruthy();
    expect(getByText('Paragraph')).toBeTruthy();
    const btns = Array.from(container.querySelectorAll('a.ph-btn'));
    expect(btns.map((b) => b.getAttribute('href'))).toEqual(['#a', '#b']);
    expect(btns[1].className).toContain('ph-btn-outline');
    const rows = Array.from(container.querySelectorAll('a.ph-row'));
    expect(rows.map((r) => r.getAttribute('href'))).toEqual(['#home', '#plant']);
    expect(rows[0].querySelector('svg')).toBeTruthy();
    expect(rows[1].querySelector('img')?.getAttribute('src')).toBe('/media/p.jpg');
    expect(getByText('Pick one')).toBeTruthy();
    expect(getByText('MW')).toBeTruthy();
  });

  it('draws the background image and the scrim', () => {
    const { container } = render(<ProjectHeroSection data={data} />);
    expect(container.querySelector('.ph-bg img')?.getAttribute('src')).toBe('/media/bg.jpg');
    expect(container.querySelector('.ph-scrim')).toBeTruthy();
  });

  it('can hide the picker and the text column', () => {
    const a = render(<ProjectHeroSection data={{ ...data, picker: { ...data.picker, enabled: false } }} />);
    expect(a.container.querySelector('.ph-picker')).toBeNull();
    a.unmount();
    const b = render(<ProjectHeroSection data={{ ...data, content: { ...data.content, enabled: false } }} />);
    expect(b.container.querySelector('.ph-text')).toBeNull();
  });

  it('is registered in the registry, the schema and the renderer', () => {
    expect(SECTION_TEMPLATES.some((t) => t.type === 'project-hero')).toBe(true);
    const tpl = getSectionTemplate('project-hero')!;
    expect(BaseSectionSchema.safeParse({ ...tpl.defaultData, id: 'section-1', order: 0 }).success).toBe(true);
    const section = { ...tpl.defaultData, id: 'section-1', order: 0 } as unknown as SectionConfig;
    const { container } = render(<SectionRenderer section={section} />);
    expect(container.querySelector('.ph-picker')).toBeTruthy();
    expect(container.textContent).not.toContain('Unknown section type');
  });
});
