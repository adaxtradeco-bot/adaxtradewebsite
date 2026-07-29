import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  HeaderVisibilityProvider,
  useHeaderVisibility,
  parseHeaderOverrideMode
} from '@/components/HeaderVisibilityProvider';

describe('HeaderVisibilityProvider / useHeaderVisibility', () => {
  it('defaults to inFirstSection=false and pageOverrideMode=inherit (fail-safe defaults)', () => {
    const { result } = renderHook(() => useHeaderVisibility(), {
      wrapper: HeaderVisibilityProvider
    });

    expect(result.current.inFirstSection).toBe(false);
    expect(result.current.pageOverrideMode).toBe('inherit');
  });

  it('throws when used outside a HeaderVisibilityProvider', () => {
    expect(() => renderHook(() => useHeaderVisibility())).toThrow(
      /useHeaderVisibility must be used within a HeaderVisibilityProvider/
    );
  });

  it('updates inFirstSection and pageOverrideMode via their setters', () => {
    const { result } = renderHook(() => useHeaderVisibility(), {
      wrapper: HeaderVisibilityProvider
    });

    act(() => {
      result.current.setInFirstSection(true);
      result.current.setPageOverrideMode('floating');
    });

    expect(result.current.inFirstSection).toBe(true);
    expect(result.current.pageOverrideMode).toBe('floating');
  });
});

describe('parseHeaderOverrideMode (Property 7 — malformed override never throws)', () => {
  it('resolves valid modes correctly', () => {
    expect(parseHeaderOverrideMode('{"mode":"floating"}')).toBe('floating');
    expect(parseHeaderOverrideMode('{"mode":"solid"}')).toBe('solid');
    expect(parseHeaderOverrideMode('{"mode":"inherit"}')).toBe('inherit');
  });

  it.each([
    undefined,
    null,
    '',
    '{',
    'null',
    '{"mode":"bogus"}',
    '{"notMode":"floating"}',
    42 as unknown as string,
    {} as unknown as string
  ])('falls back to "inherit" for malformed/unexpected input: %j', (input) => {
    expect(() => parseHeaderOverrideMode(input)).not.toThrow();
    expect(parseHeaderOverrideMode(input)).toBe('inherit');
  });
});
