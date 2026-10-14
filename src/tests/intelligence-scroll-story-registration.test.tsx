import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { SECTION_TEMPLATES, getSectionTemplate } from '@/lib/page-builder/section-registry';
import { SectionRenderer } from '@/lib/page-builder/section-renderer';
import { BaseSectionSchema } from '@/lib/page-builder/section-schemas';
import { normalizeStoryData } from '@/lib/page-builder/intelligence-scroll-story';
import { STORY_ICON_REGISTRY } from '@/lib/page-builder/intelligence-story-icons';
import type { SectionConfig } from '@/lib/page-builder/section-schemas';

class FakeObserver {
  observe() {}
  disconnect() {}
  unobserve() {}
}

describe('intelligence-scroll-story registration', () => {
  beforeEach(() => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    })) as any;
    vi.stubGlobal('IntersectionObserver', FakeObserver as any);
    vi.stubGlobal('ResizeObserver', FakeObserver as any);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('is in the registry exactly once, under Content, with the book icon', () => {
    const matches = SECTION_TEMPLATES.filter((t) => t.type === 'intelligence-scroll-story');
    expect(matches).toHaveLength(1);
    expect(matches[0].category).toBe('Content');
    expect(matches[0].icon).toBe('📖');
    expect(getSectionTemplate('intelligence-scroll-story')).toBe(matches[0]);
  });

  it('is an accepted section type in the base schema', () => {
    const tpl = getSectionTemplate('intelligence-scroll-story')!;
    const parsed = BaseSectionSchema.safeParse({ ...tpl.defaultData, id: 's1' });
    expect(parsed.success).toBe(true);
  });

  it('seeds three chapters with image, copy, proof icon, CTA and a media file reference each', () => {
    const data = normalizeStoryData(getSectionTemplate('intelligence-scroll-story')!.defaultData.data);
    expect(data.chapters).toHaveLength(3);
    data.chapters.forEach((c) => {
      expect(c.image.src).toMatch(/^\/media\/intelligence-scroll-story\/.+\.jpg$/);
      expect(c.image.alt).toBeTruthy();
      expect(c.title.split('\n').length).toBeGreaterThan(1);
      expect(c.text).toBeTruthy();
      expect(c.cta.enabled && c.cta.text).toBeTruthy();
      expect(typeof c.proof.icon === 'string' && STORY_ICON_REGISTRY[c.proof.icon as string]).toBeTruthy();
    });
  });

  it('SectionRenderer renders the type (live and builder) without throwing', () => {
    const tpl = getSectionTemplate('intelligence-scroll-story')!;
    const section = { ...tpl.defaultData, id: 'iss-1' } as SectionConfig;
    const live = render(<SectionRenderer section={section} />);
    expect(live.container.querySelectorAll('article')).toHaveLength(3);
    live.unmount();
    const builder = render(<SectionRenderer section={section} isBuilder />);
    expect(builder.container.querySelectorAll('article')).toHaveLength(3);
  });
});
