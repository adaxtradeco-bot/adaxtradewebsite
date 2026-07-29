/**
 * Bridges header-visibility state between the page's first section (deep inside
 * <main>, a sibling of <ModernNavbar> per src/app/[lang]/layout.tsx) and the
 * header itself, via React Context — the same architectural shape already used
 * by SiteSettingsProvider (src/app/layout.tsx) for the same Server/Client
 * boundary problem.
 */

'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type PageHeaderOverrideMode = 'inherit' | 'solid' | 'floating';

interface HeaderVisibilityContextType {
  /**
   * Whether the visitor is still within the page's first section.
   * Defaults to `false` so a page whose FirstSectionMarker never mounts
   * (no sections, or a page type outside PageRenderer) fails safe to
   * Solid_State rather than an indefinitely-transparent header.
   */
  inFirstSection: boolean;
  setInFirstSection: (value: boolean) => void;

  /** This page's header override, resolved from Page.headerOverride. */
  pageOverrideMode: PageHeaderOverrideMode;
  setPageOverrideMode: (mode: PageHeaderOverrideMode) => void;
}

const HeaderVisibilityContext = createContext<HeaderVisibilityContextType | undefined>(undefined);

export function HeaderVisibilityProvider({ children }: { children: ReactNode }) {
  const [inFirstSection, setInFirstSectionState] = useState(false);
  const [pageOverrideMode, setPageOverrideModeState] = useState<PageHeaderOverrideMode>('inherit');

  const setInFirstSection = useCallback((value: boolean) => {
    setInFirstSectionState(value);
  }, []);

  const setPageOverrideMode = useCallback((mode: PageHeaderOverrideMode) => {
    setPageOverrideModeState(mode);
  }, []);

  return (
    <HeaderVisibilityContext.Provider
      value={{ inFirstSection, setInFirstSection, pageOverrideMode, setPageOverrideMode }}
    >
      {children}
    </HeaderVisibilityContext.Provider>
  );
}

export function useHeaderVisibility(): HeaderVisibilityContextType {
  const context = useContext(HeaderVisibilityContext);
  if (context === undefined) {
    throw new Error('useHeaderVisibility must be used within a HeaderVisibilityProvider');
  }
  return context;
}

const VALID_MODES: PageHeaderOverrideMode[] = ['inherit', 'solid', 'floating'];

/**
 * Parses `Page.headerOverride` (a JSON string, e.g. `{"mode":"floating"}`) into a
 * PageHeaderOverrideMode. Never throws — malformed JSON, an unrecognized `mode`,
 * or a missing/null value all resolve to `'inherit'` (Requirement 4.6).
 */
export function parseHeaderOverrideMode(raw: unknown): PageHeaderOverrideMode {
  if (!raw || typeof raw !== 'string') return 'inherit';
  try {
    const parsed = JSON.parse(raw);
    const mode = parsed?.mode;
    return VALID_MODES.includes(mode) ? mode : 'inherit';
  } catch {
    return 'inherit';
  }
}
