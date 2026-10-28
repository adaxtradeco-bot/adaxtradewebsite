'use client';

import { useEffect, type RefObject } from 'react';

/** CSS custom property (on <html>) holding the live height, in px, of the header that takes up space. */
export const HEADER_HEIGHT_VAR = '--site-header-h';

/**
 * Publishes the real rendered height of the site header as `--site-header-h` on <html>.
 *
 * - Solid header (`sticky`, in the document flow): the measured height, kept in sync on resize
 *   (e.g. when the menu wraps on narrow widths).
 * - Floating header (`fixed`, out of the flow): 0px, because it reserves no space.
 *
 * Nothing reads the variable unless a section opts in with `var(--site-header-h, <fallback>)`,
 * so publishing it changes no existing page.
 */
export function useHeaderHeightVar(ref: RefObject<HTMLElement>, floating: boolean) {
  useEffect(() => {
    const root = document.documentElement;
    const el = ref.current;

    if (floating || !el) {
      root.style.setProperty(HEADER_HEIGHT_VAR, '0px');
      return () => root.style.removeProperty(HEADER_HEIGHT_VAR);
    }

    // offsetHeight ignores transforms, so the auto-hide slide-up does not change the value.
    const apply = () => root.style.setProperty(HEADER_HEIGHT_VAR, `${el.offsetHeight}px`);
    apply();

    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(apply) : null;
    observer?.observe(el);
    window.addEventListener('resize', apply);

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', apply);
      root.style.removeProperty(HEADER_HEIGHT_VAR);
    };
  }, [ref, floating]);
}
