import { describe, it, expect } from 'vitest';
import {
  normalizeGatewayData,
  mergeDeep,
  resolveMediaKind,
  isVideoUrl,
  buildGradientCss,
  hexWithAlpha,
  DEFAULT_GATEWAY_BACKGROUND,
} from '@/lib/page-builder/split-gateway';
import { getIn, setIn } from '@/components/admin/PageBuilder/SplitGatewayPropertyPanel';

describe('split-gateway logic', () => {
  it('normalizes an empty object to a complete, render-safe model', () => {
    const d = normalizeGatewayData({});
    expect(d.cards).toEqual([]);
    expect(d.background.type).toBe('gradient');
    expect(d.motion.ctaHover).toBe('fill');
    expect(d.colors.ctaHoverText).toBe('#000000');
    expect(d.layout.maxWidth).toBeGreaterThan(0);
  });

  it('fills card defaults, ids and accepts plain-string services', () => {
    const d = normalizeGatewayData({
      cards: [{ title: 'A', services: ['one', { text: 'two', href: '/x' }] }, { title: 'B', id: 'custom' }],
    });
    expect(d.cards.map((c) => c.id)).toEqual(['card-1', 'custom']);
    expect(d.cards[0].services).toEqual([
      { text: 'one', href: '' },
      { text: 'two', href: '/x' },
    ]);
    expect(d.cards[0].cta.enabled).toBe(true);
    expect(d.cards[1].media.fit).toBe('cover');
  });

  it('merges nested objects but replaces arrays and ignores null/undefined', () => {
    const merged = mergeDeep({ a: { b: 1, c: 2 }, list: [1, 2] }, { a: { b: 9 }, list: [3], x: null });
    expect(merged).toEqual({ a: { b: 9, c: 2 }, list: [3] });
  });

  it('detects video by extension and respects an explicit type', () => {
    expect(isVideoUrl('/media/a.mp4')).toBe(true);
    expect(isVideoUrl('/media/a.webm?x=1')).toBe(true);
    expect(isVideoUrl('/media/a.jpg')).toBe(false);
    expect(resolveMediaKind({ type: 'image', src: '/a.mp4' })).toBe('video');
    expect(resolveMediaKind({ type: 'video', src: '/a.jpg' })).toBe('video');
    expect(resolveMediaKind({ type: 'none', src: '/a.jpg' })).toBe('none');
    expect(resolveMediaKind({ type: 'image', src: '' })).toBe('none');
  });

  it('builds linear, radial and glow gradients', () => {
    const g = DEFAULT_GATEWAY_BACKGROUND.gradient;
    expect(buildGradientCss({ ...g, glow: { ...g.glow, enabled: false } })).toBe('linear-gradient(135deg, #091A3D, #13357A, #0A5266)');
    expect(buildGradientCss({ ...g, type: 'radial', glow: { ...g.glow, enabled: false } })).toContain('radial-gradient(circle');
    expect(buildGradientCss(g)).toContain('rgba(226, 194, 133, 0.22)');
    expect(buildGradientCss({ ...g, via: '', glow: { ...g.glow, enabled: false } })).toBe('linear-gradient(135deg, #091A3D, #0A5266)');
  });

  it('converts hex to rgba and leaves other colours alone', () => {
    expect(hexWithAlpha('#fff', 0.5)).toBe('rgba(255, 255, 255, 0.5)');
    expect(hexWithAlpha('rgb(1,2,3)', 0.5)).toBe('rgb(1,2,3)');
  });

  it('getIn / setIn are immutable and create missing containers', () => {
    const src = { a: { b: [1, 2] } };
    const next = setIn(src, ['a', 'b', 1], 9);
    expect(next.a.b).toEqual([1, 9]);
    expect(src.a.b).toEqual([1, 2]);
    expect(setIn({}, ['x', 'y'], 1)).toEqual({ x: { y: 1 } });
    expect(setIn({}, ['cards', 0, 'title'], 't')).toEqual({ cards: [{ title: 't' }] });
    expect(getIn(next, ['a', 'b', 1])).toBe(9);
    expect(getIn(next, ['q', 'z'])).toBeUndefined();
  });
});
