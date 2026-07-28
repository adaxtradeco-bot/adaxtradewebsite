import { describe, it, expect } from 'vitest';
import { SECTION_TEMPLATES } from '@/lib/page-builder/section-registry';

describe('HOME_SHOWCASE_TEMPLATES registry integrity', () => {
  it('contains exactly one home-cover template and one home-innovation template', () => {
    const homeCovers = SECTION_TEMPLATES.filter((t) => t.type === 'home-cover');
    const homeInnovations = SECTION_TEMPLATES.filter((t) => t.type === 'home-innovation');
    expect(homeCovers).toHaveLength(1);
    expect(homeInnovations).toHaveLength(1);
  });

  it('home-cover default data has no empty required media fields (Property 11)', () => {
    const template = SECTION_TEMPLATES.find((t) => t.type === 'home-cover')!;
    const data = template.defaultData.data as any;
    expect(data.videoUrl).toBeTruthy();
    expect(data.imageUrl).toBeTruthy();
    expect(data.posterImageDesktop).toBeTruthy();
    expect(data.opening?.logoUrl).toBeTruthy();
  });

  it('home-innovation default data has at least 5 cards, both formats, both media types, no empty mediaUrl (Property 11)', () => {
    const template = SECTION_TEMPLATES.find((t) => t.type === 'home-innovation')!;
    const data = template.defaultData.data as any;
    const cards: any[] = data.cards;

    expect(cards.length).toBeGreaterThanOrEqual(5);
    cards.forEach((card) => {
      expect(card.mediaUrl).toBeTruthy();
    });

    expect(cards.some((c) => c.format === 'horizontal')).toBe(true);
    expect(cards.some((c) => c.format === 'vertical')).toBe(true);
    expect(cards.some((c) => c.mediaType === 'video')).toBe(true);
    expect(cards.some((c) => c.mediaType === 'image')).toBe(true);
  });

  it('home-innovation default data ships a working locationMap with every card location-tagged', () => {
    const template = SECTION_TEMPLATES.find((t) => t.type === 'home-innovation')!;
    const data = template.defaultData.data as any;
    expect(data.locationMap?.enabled).toBe(true);
    expect(data.locationMap?.mapImageUrl).toBeTruthy();
    expect(data.cards.every((c: any) => !!c.locationTag)).toBe(true);
  });
});
