/**
 * Drives the header's Auto-Hide behavior: hides on scroll-down past a small
 * deadzone, reveals on scroll-up. Kept separate from HeaderVisibilityProvider
 * (which tracks a one-shot "still in first section" boundary crossing) because
 * this is a continuous, direction-based scroll concern local to ModernNavbar —
 * no other component needs it, so it doesn't belong in shared context.
 */

'use client';

import { useEffect, useRef, useState } from 'react';

const SCROLL_DEADZONE_PX = 10;

interface UseHeaderScrollStateOptions {
  /** Site-wide header.autoHide.enabled setting. */
  enabled: boolean;
  /** True while the header must stay visible regardless of scroll direction
   *  (Floating_State over the hero, an open dropdown, or the mobile menu). */
  suppressed: boolean;
}

/** Returns whether the header should currently be hidden (translated out of view). */
export function useHeaderScrollState({ enabled, suppressed }: UseHeaderScrollStateOptions): boolean {
  const [headerHidden, setHeaderHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    lastScrollY.current = window.scrollY;

    if (!enabled) {
      setHeaderHidden(false);
      return;
    }

    const handleScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY.current;

      if (Math.abs(delta) < SCROLL_DEADZONE_PX) {
        return;
      }

      if (delta > 0 && currentY > SCROLL_DEADZONE_PX) {
        setHeaderHidden(true);
      } else {
        setHeaderHidden(false);
      }

      lastScrollY.current = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [enabled]);

  if (suppressed) return false;
  return headerHidden;
}
