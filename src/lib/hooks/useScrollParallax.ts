/**
 * Shared scroll/motion hooks for scroll-linked builder sections
 * (home-cover, home-innovation). Centralizes framer-motion usage so the
 * "scroll-linked motion" pattern lives in one reviewable place.
 */

'use client';

import { RefObject, useEffect, useState } from 'react';
import { MotionValue, useScroll, useTransform } from 'framer-motion';

/** Reflects `prefers-reduced-motion: reduce`, SSR-safe, live-updating. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mql.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return reduced;
}

/** Narrow-viewport (below `md`) detector, SSR-safe, used to gate sticky/motion behavior. */
export function useIsMobileViewport(breakpointPx: number = 768): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia(`(max-width: ${breakpointPx - 1}px)`);
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [breakpointPx]);

  return isMobile;
}

/**
 * Scroll progress for a section that pins/reveals its content, scoped to `sectionRef`
 * (never `window`-global) so it's safe to stack arbitrary sections above/below.
 */
export function useStickyReveal(sectionRef: RefObject<HTMLElement>) {
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });
  return { scrollYProgress };
}

/**
 * Differential vertical offset driven by scroll position within `sectionRef`.
 * Returns a static (non-animating) MotionValue of 0 when `reduced` is true or
 * `intensity <= 0`, so callers can bind it unconditionally.
 */
export function useParallaxOffset(
  sectionRef: RefObject<HTMLElement>,
  intensity: number,
  reduced: boolean
): MotionValue<number> {
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const clamped = Math.max(0, Math.min(100, intensity || 0));
  const range = reduced ? 0 : clamped * 1.6; // px of total travel

  return useTransform(scrollYProgress, [0, 1], [-range / 2, range / 2]);
}
