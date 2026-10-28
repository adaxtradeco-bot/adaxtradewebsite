import { describe, it, expect, vi, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import React, { useRef } from 'react';
import { useHeaderHeightVar, HEADER_HEIGHT_VAR } from '@/lib/hooks/useHeaderHeightVar';

function Probe({ floating, height }: { floating: boolean; height: number }) {
  const ref = useRef<HTMLElement>(null);
  useHeaderHeightVar(ref, floating);
  return <nav ref={ref} data-h={height} />;
}

const read = () => document.documentElement.style.getPropertyValue(HEADER_HEIGHT_VAR);

describe('useHeaderHeightVar', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    document.documentElement.style.removeProperty(HEADER_HEIGHT_VAR);
  });

  it('publishes the measured height for a solid header, follows the observer, and cleans up', () => {
    let callback: () => void = () => {};
    class FakeRO {
      constructor(cb: () => void) {
        callback = cb;
      }
      observe() {}
      disconnect() {}
    }
    vi.stubGlobal('ResizeObserver', FakeRO as any);
    let h = 96;
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, get: () => h });

    const { unmount } = render(<Probe floating={false} height={h} />);
    expect(read()).toBe('96px');
    h = 140; // menu wrapped onto a second row
    callback();
    expect(read()).toBe('140px');
    unmount();
    expect(read()).toBe('');
  });

  it('publishes 0px while the header floats (it reserves no space)', () => {
    vi.stubGlobal('ResizeObserver', undefined as any);
    const { unmount } = render(<Probe floating height={96} />);
    expect(read()).toBe('0px');
    unmount();
    expect(read()).toBe('');
  });

  it('works without ResizeObserver (falls back to window resize)', () => {
    vi.stubGlobal('ResizeObserver', undefined as any);
    let h = 80;
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, get: () => h });
    render(<Probe floating={false} height={h} />);
    expect(read()).toBe('80px');
    h = 100;
    window.dispatchEvent(new Event('resize'));
    expect(read()).toBe('100px');
  });
});
