import { describe, it, expect, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHeaderScrollState } from '@/lib/hooks/useHeaderScrollState';

function setScrollY(value: number) {
  Object.defineProperty(window, 'scrollY', { value, writable: true, configurable: true });
}

function fireScroll() {
  window.dispatchEvent(new Event('scroll'));
}

describe('useHeaderScrollState (Property 5)', () => {
  afterEach(() => {
    setScrollY(0);
    vi.restoreAllMocks();
  });

  it('never hides the header when autoHide is disabled', () => {
    setScrollY(0);
    const { result } = renderHook(({ enabled, suppressed }) => useHeaderScrollState({ enabled, suppressed }), {
      initialProps: { enabled: false, suppressed: false }
    });

    act(() => {
      setScrollY(500);
      fireScroll();
    });

    expect(result.current).toBe(false);
  });

  it('hides on scroll-down past the deadzone and reveals on scroll-up', () => {
    setScrollY(0);
    const { result } = renderHook(() => useHeaderScrollState({ enabled: true, suppressed: false }));

    act(() => {
      setScrollY(200);
      fireScroll();
    });
    expect(result.current).toBe(true);

    act(() => {
      setScrollY(150);
      fireScroll();
    });
    expect(result.current).toBe(false);
  });

  it('ignores movement inside the deadzone (no jitter)', () => {
    setScrollY(100);
    const { result } = renderHook(() => useHeaderScrollState({ enabled: true, suppressed: false }));

    act(() => {
      setScrollY(105); // < 10px deadzone
      fireScroll();
    });
    expect(result.current).toBe(false);
  });

  it('is never true while suppressed (floating over hero, dropdown open, or mobile menu open)', () => {
    setScrollY(0);
    const { result } = renderHook(() => useHeaderScrollState({ enabled: true, suppressed: true }));

    act(() => {
      setScrollY(500);
      fireScroll();
    });

    expect(result.current).toBe(false);
  });
});
