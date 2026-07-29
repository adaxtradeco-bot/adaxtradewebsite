/**
 * Pure Header Settings resolution logic, extracted out of ModernNavbar so the
 * effective-mode / chrome-selection rules (design.md's Correctness Properties
 * 2 and 3) are unit-testable without mounting the full navbar component tree.
 */

import { HeaderChromeState, HeaderSettings } from '@/hooks/useSiteSettings';
import { PageHeaderOverrideMode } from '@/components/HeaderVisibilityProvider';

/**
 * A page's own override always wins when explicitly set; `'inherit'` (the
 * default for every page) falls back to the site-wide setting.
 * Validates: Requirements 4.5, 4.6 / Property 2.
 */
export function resolveEffectiveHeaderMode(
  siteWideMode: 'solid' | 'floating',
  pageOverrideMode: PageHeaderOverrideMode
): 'solid' | 'floating' {
  return pageOverrideMode === 'inherit' ? siteWideMode : pageOverrideMode;
}

/**
 * Floating_State applies only when the effective mode is 'floating' AND the
 * visitor is still within the page's first section; every other combination
 * (including 'floating' mode once scrolled past, or no first section at all)
 * resolves to Solid_State.
 * Validates: Requirements 5.1, 5.2, 5.5 / Property 3, Property 4.
 */
export function resolveHeaderChrome(
  headerSettings: HeaderSettings,
  effectiveMode: 'solid' | 'floating',
  inFirstSection: boolean
): { isFloatingNow: boolean; chrome: HeaderChromeState } {
  const isFloatingNow = effectiveMode === 'floating' && inFirstSection;
  return { isFloatingNow, chrome: isFloatingNow ? headerSettings.floatingState : headerSettings.solidState };
}
