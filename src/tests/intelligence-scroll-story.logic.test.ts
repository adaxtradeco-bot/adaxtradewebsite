import { describe, it, expect } from 'vitest';
import {
  MAX_CHAPTERS,
  activeIndexAt,
  buildTimeline,
  chapterFrame,
  chapterNumberLabel,
  chapterTargetProgress,
  lerpKeys,
  normalizeStoryData,
  titleLines,
} from '@/lib/page-builder/intelligence-scroll-story';

const motion = { reveal: 'right', imageZoom: 1.08, copySlide: 45 } as const;

describe('intelligence-scroll-story timeline — three chapters match the reference keyframes', () => {
  const tl = buildTimeline(3);

  it('puts the chapter boundaries at 0.28 and 0.735 with a 0.0825 hand-over window', () => {
    expect(tl.boundaries[1]).toBeCloseTo(0.28, 3);
    expect(tl.boundaries[2]).toBeCloseTo(0.735, 3);
    expect(tl.half).toBeCloseTo(0.0825, 4);
    expect(tl.eps).toBeCloseTo(0.005, 4);
  });

  it('chapter 1 copy is visible at the start, gone by the first boundary', () => {
    expect(chapterFrame(0, 0, tl, motion).copyOpacity).toBe(1);
    expect(chapterFrame(0, 0.1, tl, motion).copyOpacity).toBe(1);
    expect(chapterFrame(0, 0.28, tl, motion).copyOpacity).toBe(0);
  });

  it('chapter 2 copy appears after the first boundary and leaves before the second', () => {
    expect(chapterFrame(1, 0.28, tl, motion).copyOpacity).toBe(0);
    expect(chapterFrame(1, 0.5, tl, motion).copyOpacity).toBe(1);
    expect(chapterFrame(1, 0.735, tl, motion).copyOpacity).toBe(0);
  });

  it('chapter 3 copy stays visible to the end', () => {
    expect(chapterFrame(2, 0.5, tl, motion).copyOpacity).toBe(0);
    expect(chapterFrame(2, 0.9, tl, motion).copyOpacity).toBe(1);
    expect(chapterFrame(2, 1, tl, motion).copyOpacity).toBe(1);
  });

  it('copy slides: first drifts up to -45, middle rests at 0, last arrives from +45', () => {
    expect(chapterFrame(0, 0, tl, motion).copyY).toBe(0);
    expect(chapterFrame(0, 0.5, tl, motion).copyY).toBe(-45);
    expect(chapterFrame(1, 0.5, tl, motion).copyY).toBe(0);
    expect(chapterFrame(1, 0, tl, motion).copyY).toBe(45);
    expect(chapterFrame(2, 0, tl, motion).copyY).toBe(45);
    expect(chapterFrame(2, 1, tl, motion).copyY).toBe(0);
  });

  it('images 2 and 3 are wiped in from the right over their window; image 1 is never clipped', () => {
    expect(chapterFrame(0, 0.5, tl, motion).clip).toBe('none');
    expect(chapterFrame(1, 0, tl, motion).clip).toBe('inset(0% 0% 0% 100.000%)');
    expect(chapterFrame(1, tl.boundaries[1], tl, motion).clip).toBe('inset(0% 0% 0% 50.000%)');
    expect(chapterFrame(1, 0.5, tl, motion).clip).toBe('inset(0% 0% 0% 0.000%)');
    expect(chapterFrame(2, 0.5, tl, motion).clip).toBe('inset(0% 0% 0% 100.000%)');
    expect(chapterFrame(2, 1, tl, motion).clip).toBe('inset(0% 0% 0% 0.000%)');
  });

  it('every image zooms from 1.08 to 1 across the whole story', () => {
    expect(chapterFrame(0, 0, tl, motion).scale).toBeCloseTo(1.08, 4);
    expect(chapterFrame(0, 0.5, tl, motion).scale).toBeCloseTo(1.04, 4);
    expect(chapterFrame(0, 1, tl, motion).scale).toBeCloseTo(1, 4);
  });

  it('activeIndexAt switches at the boundaries', () => {
    expect(activeIndexAt(0, tl)).toBe(0);
    expect(activeIndexAt(0.279, tl)).toBe(0);
    expect(activeIndexAt(tl.boundaries[1], tl)).toBe(1);
    expect(activeIndexAt(0.5, tl)).toBe(1);
    expect(activeIndexAt(tl.boundaries[2], tl)).toBe(2);
    expect(activeIndexAt(1, tl)).toBe(2);
  });

  it('nav targets land on 0, the middle of band two, and 1', () => {
    expect(chapterTargetProgress(0, tl)).toBe(0);
    expect(chapterTargetProgress(1, tl)).toBeCloseTo(0.5075, 3);
    expect(chapterTargetProgress(2, tl)).toBe(1);
  });
});

describe('intelligence-scroll-story timeline — any chapter count (1–10)', () => {
  for (let n = 1; n <= MAX_CHAPTERS; n++) {
    it(`n=${n}: at each chapter's target exactly that chapter is shown and revealed`, () => {
      const tl = buildTimeline(n);
      for (let i = 0; i < n; i++) {
        const p = chapterTargetProgress(i, tl);
        expect(activeIndexAt(p, tl)).toBe(i);
        for (let j = 0; j < n; j++) {
          const f = chapterFrame(j, p, tl, motion);
          expect(f.copyOpacity).toBeCloseTo(j === i ? 1 : 0, 6);
          if (j === i) expect(f.copyY).toBeCloseTo(0, 6);
          // image j is revealed when j <= i (stacked), hidden otherwise
          if (j > 0) expect(f.clip).toBe(j <= i ? 'inset(0% 0% 0% 0.000%)' : 'inset(0% 0% 0% 100.000%)');
        }
      }
    });

    it(`n=${n}: boundaries are strictly increasing inside (0,1) and the window never overlaps its neighbour`, () => {
      const tl = buildTimeline(n);
      let prev = 0;
      for (let k = 1; k < n; k++) {
        expect(tl.boundaries[k]).toBeGreaterThan(prev);
        expect(tl.boundaries[k]).toBeLessThan(1);
        if (k > 1) expect(tl.boundaries[k] - tl.half).toBeGreaterThan(tl.boundaries[k - 1] + tl.half - 1e-9);
        prev = tl.boundaries[k];
      }
      expect(tl.eps).toBeLessThan(tl.half);
    });
  }

  it('opacity is always within [0, 1] while sweeping progress', () => {
    const tl = buildTimeline(7);
    for (let p = 0; p <= 1.0001; p += 0.005) {
      for (let i = 0; i < 7; i++) {
        const { copyOpacity, imageOpacity } = chapterFrame(i, Math.min(1, p), tl, motion);
        expect(copyOpacity).toBeGreaterThanOrEqual(-1e-9);
        expect(copyOpacity).toBeLessThanOrEqual(1 + 1e-9);
        expect(imageOpacity).toBeGreaterThanOrEqual(0);
        expect(imageOpacity).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe('reveal directions', () => {
  const tl = buildTimeline(3);
  const at = (reveal: any) => chapterFrame(1, tl.boundaries[1], tl, { ...motion, reveal });

  it('maps each direction to the matching inset edge', () => {
    expect(at('right').clip).toBe('inset(0% 0% 0% 50.000%)');
    expect(at('left').clip).toBe('inset(0% 50.000% 0% 0%)');
    expect(at('up').clip).toBe('inset(50.000% 0% 0% 0%)');
    expect(at('down').clip).toBe('inset(0% 0% 50.000% 0%)');
  });

  it('fade uses image opacity instead of a clip-path', () => {
    const f = at('fade');
    expect(f.clip).toBe('none');
    expect(f.imageOpacity).toBeCloseTo(0.5, 3);
  });
});

describe('lerpKeys', () => {
  it('clamps below, above and interpolates between keys', () => {
    expect(lerpKeys(-1, [0, 1], [10, 20])).toBe(10);
    expect(lerpKeys(2, [0, 1], [10, 20])).toBe(20);
    expect(lerpKeys(0.5, [0, 1], [10, 20])).toBe(15);
  });
});

describe('normalizeStoryData', () => {
  it('turns nothing into a complete, valid config', () => {
    const d = normalizeStoryData(undefined);
    expect(d.chapters).toEqual([]);
    expect(d.navigation.style).toBe('tabs');
    expect(d.layout.copyWidth).toBe(500);
    expect(d.motion.reveal).toBe('right');
    expect(d.colors.theme).toBe('light');
  });

  it('clamps numbers and rejects unknown enum values', () => {
    const d = normalizeStoryData({
      layout: { copyWidth: 99999, titleSize: -5, copyPosition: 'middle', scrollPerChapterVh: '120' },
      motion: { reveal: 'spin', imageZoom: 9 },
      navigation: { style: 'carousel' },
      colors: { theme: 'neon' },
    });
    expect(d.layout.copyWidth).toBe(760);
    expect(d.layout.titleSize).toBe(24);
    expect(d.layout.copyPosition).toBe('start');
    expect(d.layout.scrollPerChapterVh).toBe(120);
    expect(d.motion.reveal).toBe('right');
    expect(d.motion.imageZoom).toBe(1.4);
    expect(d.navigation.style).toBe('tabs');
    expect(d.colors.theme).toBe('light');
  });

  it('caps chapters at 10 and fills chapter defaults', () => {
    const d = normalizeStoryData({ chapters: Array.from({ length: 14 }, (_, i) => ({ name: `C${i}` })) });
    expect(d.chapters).toHaveLength(MAX_CHAPTERS);
    expect(d.chapters[0].id).toBe('chapter-1');
    expect(d.chapters[0].image.src).toBe('');
    expect(d.chapters[0].cta.href).toBe('#');
    expect(d.chapters[0].tone).toBe('default');
  });

  it('keeps Lucide names and Font Awesome configs as the proof icon', () => {
    const fa = { name: 'shield', type: 'solid', size: 'lg', color: '#000' };
    const d = normalizeStoryData({
      chapters: [{ proof: { icon: 'eye', text: 'a' } }, { proof: { icon: fa, text: 'b' } }, { proof: { icon: 42, text: 'c' } }],
    });
    expect(d.chapters[0].proof.icon).toBe('eye');
    expect(d.chapters[1].proof.icon).toEqual(fa);
    expect(d.chapters[2].proof.icon).toBeNull();
    expect(d.chapters[0].proof.enabled).toBe(true);
  });
});

describe('small helpers', () => {
  it('numbers chapters automatically unless overridden', () => {
    const ch = normalizeStoryData({ chapters: [{}, { number: 'II' }] }).chapters;
    expect(chapterNumberLabel(ch[0], 0)).toBe('01');
    expect(chapterNumberLabel(ch[1], 1)).toBe('II');
  });

  it('splits titles on newlines and drops blank lines', () => {
    expect(titleLines('One.\n\n  Two.  \n')).toEqual(['One.', 'Two.']);
  });
});
