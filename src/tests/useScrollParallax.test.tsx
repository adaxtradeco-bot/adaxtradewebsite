import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, render } from '@testing-library/react';
import { useRef } from 'react';
import {
  usePrefersReducedMotion,
  useIsMobileViewport,
  useParallaxOffset,
} from '@/lib/hooks/useScrollParallax';

/** Mounts a real DOM node and calls useParallaxOffset against it (framer-motion's
 *  useScroll requires a hydrated target element, unlike a bare createRef). */
function ParallaxProbe({
  intensity,
  reduced,
  onValue,
}: {
  intensity: number;
  reduced: boolean;
  onValue: (v: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const y = useParallaxOffset(ref as any, intensity, reduced);
  onValue(y.get());
  return <div ref={ref} style={{ height: 10 }} />;
}

function mockMatchMedia(initialMatches: boolean) {
  const listeners: Array<(e: MediaQueryListEvent) => void> = [];
  const mql = {
    matches: initialMatches,
    media: '',
    addEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => {
      listeners.push(cb);
    },
    removeEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => {
      const i = listeners.indexOf(cb);
      if (i >= 0) listeners.splice(i, 1);
    },
    dispatch: (matches: boolean) => {
      mql.matches = matches;
      listeners.forEach((cb) => cb({ matches } as MediaQueryListEvent));
    },
  };
  window.matchMedia = vi.fn().mockReturnValue(mql) as any;
  return mql;
}

describe('usePrefersReducedMotion', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reflects the initial matchMedia result', () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(true);
  });

  it('updates when matchMedia reports a change', () => {
    const mql = mockMatchMedia(false);
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);

    act(() => {
      mql.dispatch(true);
    });

    expect(result.current).toBe(true);
  });

  it('does not throw when matchMedia is unavailable (SSR-like)', () => {
    const original = window.matchMedia;
    // @ts-expect-error simulate an environment without matchMedia
    delete window.matchMedia;
    expect(() => renderHook(() => usePrefersReducedMotion())).not.toThrow();
    window.matchMedia = original;
  });
});

describe('useIsMobileViewport', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reflects the mocked breakpoint match', () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useIsMobileViewport(768));
    expect(result.current).toBe(true);
  });
});

describe('useParallaxOffset', () => {
  beforeEach(() => {
    mockMatchMedia(false);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns a static (zero) value when reduced=true', () => {
    let value = -1;
    render(<ParallaxProbe intensity={50} reduced={true} onValue={(v) => (value = v)} />);
    expect(value).toBe(0);
  });

  it('returns a static (zero) value when intensity=0', () => {
    let value = -1;
    render(<ParallaxProbe intensity={0} reduced={false} onValue={(v) => (value = v)} />);
    expect(value).toBe(0);
  });

  it('does not throw when mounted normally with a non-zero intensity', () => {
    expect(() =>
      render(<ParallaxProbe intensity={30} reduced={false} onValue={() => {}} />)
    ).not.toThrow();
  });
});
