/**
 * Wraps a page's first rendered section and reports, via HeaderVisibilityContext,
 * whether it is still intersecting the viewport. ModernNavbar (a sibling of the
 * page content, not a parent) reads that value to decide Floating_State vs
 * Solid_State. Uses IntersectionObserver against the section's real rendered
 * height rather than a fixed scroll-offset, so behavior is correct regardless
 * of which section type is first.
 */

'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { useHeaderVisibility } from './HeaderVisibilityProvider';

interface FirstSectionMarkerProps {
  children: ReactNode;
}

export function FirstSectionMarker({ children }: FirstSectionMarkerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { setInFirstSection } = useHeaderVisibility();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Optimistic initial state: assume visible until the observer's first
    // callback fires, so a floating header never flashes solid on first paint.
    setInFirstSection(true);

    const observer = new IntersectionObserver(
      ([entry]) => setInFirstSection(entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      setInFirstSection(false);
    };
  }, [setInFirstSection]);

  return <div ref={ref}>{children}</div>;
}
