import { describe, it, expect } from 'vitest';
import { resolveEffectiveHeaderMode, resolveHeaderChrome } from '@/lib/header/resolveHeaderState';
import { HeaderSettings } from '@/hooks/useSiteSettings';

const headerSettings: HeaderSettings = {
  mode: 'solid',
  transitionDurationMs: 250,
  floatingState: {
    background: 'transparent',
    backgroundOpacity: 0,
    backdropBlur: false,
    textColor: '#ffffff',
    linkHoverColor: '#ffffff',
    logoVariant: 'light',
    logoUrlOverride: '',
    showBorder: false,
    showShadow: false
  },
  solidState: {
    background: '',
    backgroundOpacity: 0.9,
    backdropBlur: true,
    textColor: '',
    linkHoverColor: '',
    logoVariant: 'dark',
    logoUrlOverride: '',
    showBorder: false,
    showShadow: false
  },
  autoHide: { enabled: false },
  height: { desktop: 64, mobile: 56 }
};

describe('resolveEffectiveHeaderMode (Property 2)', () => {
  it.each([
    ['solid', 'inherit', 'solid'],
    ['floating', 'inherit', 'floating'],
    ['solid', 'floating', 'floating'],
    ['floating', 'solid', 'solid'],
    ['solid', 'solid', 'solid'],
    ['floating', 'floating', 'floating']
  ] as const)('site-wide=%s, override=%s -> %s', (siteWide, override, expected) => {
    expect(resolveEffectiveHeaderMode(siteWide, override)).toBe(expected);
  });
});

describe('resolveHeaderChrome (Properties 3 & 4)', () => {
  it('renders floatingState only when effective mode is floating AND still in first section', () => {
    const { isFloatingNow, chrome } = resolveHeaderChrome(headerSettings, 'floating', true);
    expect(isFloatingNow).toBe(true);
    expect(chrome).toBe(headerSettings.floatingState);
  });

  it('renders solidState once scrolled past the first section, even in floating mode', () => {
    const { isFloatingNow, chrome } = resolveHeaderChrome(headerSettings, 'floating', false);
    expect(isFloatingNow).toBe(false);
    expect(chrome).toBe(headerSettings.solidState);
  });

  it('renders solidState always when effective mode is solid, regardless of inFirstSection', () => {
    expect(resolveHeaderChrome(headerSettings, 'solid', true).chrome).toBe(headerSettings.solidState);
    expect(resolveHeaderChrome(headerSettings, 'solid', false).chrome).toBe(headerSettings.solidState);
  });

  it('fails safe to solidState when inFirstSection defaults to false (no sections / marker never mounted)', () => {
    const { isFloatingNow, chrome } = resolveHeaderChrome(headerSettings, 'floating', false);
    expect(isFloatingNow).toBe(false);
    expect(chrome).toBe(headerSettings.solidState);
  });
});
