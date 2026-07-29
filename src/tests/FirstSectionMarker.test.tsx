import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { FirstSectionMarker } from '@/components/FirstSectionMarker';
import { HeaderVisibilityProvider, useHeaderVisibility } from '@/components/HeaderVisibilityProvider';

/** Minimal IntersectionObserver mock capturing the callback so tests can fire it manually. */
class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];
  callback: IntersectionObserverCallback;
  observed: Element[] = [];

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    MockIntersectionObserver.instances.push(this);
  }

  observe(el: Element) {
    this.observed.push(el);
  }

  unobserve() {}
  disconnect() {}

  trigger(isIntersecting: boolean) {
    this.callback(
      [{ isIntersecting } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver
    );
  }
}

function ReadState({ onRender }: { onRender: (v: boolean) => void }) {
  const { inFirstSection } = useHeaderVisibility();
  onRender(inFirstSection);
  return null;
}

describe('FirstSectionMarker', () => {
  afterEach(() => {
    MockIntersectionObserver.instances = [];
    vi.restoreAllMocks();
  });

  it('optimistically reports inFirstSection=true on mount, before the observer fires', () => {
    (global as any).IntersectionObserver = MockIntersectionObserver;
    let latest = false;

    render(
      <HeaderVisibilityProvider>
        <FirstSectionMarker>
          <div>hero content</div>
        </FirstSectionMarker>
        <ReadState onRender={(v) => (latest = v)} />
      </HeaderVisibilityProvider>
    );

    expect(latest).toBe(true);
  });

  it('reports inFirstSection=false once the observer reports the section left the viewport', () => {
    (global as any).IntersectionObserver = MockIntersectionObserver;
    let latest = false;

    render(
      <HeaderVisibilityProvider>
        <FirstSectionMarker>
          <div>hero content</div>
        </FirstSectionMarker>
        <ReadState onRender={(v) => (latest = v)} />
      </HeaderVisibilityProvider>
    );

    const observer = MockIntersectionObserver.instances[0];
    act(() => observer.trigger(false));

    expect(latest).toBe(false);
  });

  it('reports inFirstSection=true again if the section scrolls back into view', () => {
    (global as any).IntersectionObserver = MockIntersectionObserver;
    let latest = false;

    render(
      <HeaderVisibilityProvider>
        <FirstSectionMarker>
          <div>hero content</div>
        </FirstSectionMarker>
        <ReadState onRender={(v) => (latest = v)} />
      </HeaderVisibilityProvider>
    );

    const observer = MockIntersectionObserver.instances[0];
    act(() => observer.trigger(false));
    act(() => observer.trigger(true));

    expect(latest).toBe(true);
  });

  it('resets to false on unmount, so a page navigated away leaves no stale floating state behind', () => {
    (global as any).IntersectionObserver = MockIntersectionObserver;
    let latest = false;

    function Harness({ showMarker }: { showMarker: boolean }) {
      return (
        <HeaderVisibilityProvider>
          {showMarker && (
            <FirstSectionMarker>
              <div>hero content</div>
            </FirstSectionMarker>
          )}
          <ReadState onRender={(v) => (latest = v)} />
        </HeaderVisibilityProvider>
      );
    }

    const { rerender } = render(<Harness showMarker={true} />);
    expect(latest).toBe(true);

    rerender(<Harness showMarker={false} />);
    expect(latest).toBe(false);
  });
});
