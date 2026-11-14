/**
 * Admin-only theme (light/dark), independent from the public site theme.
 * Stored under its own localStorage key and applied to <html> only while the
 * admin layout is mounted; the site's next-themes class is restored on exit.
 */

'use client';

import { useCallback, useEffect, useLayoutEffect, useState } from 'react';

export type AdminTheme = 'light' | 'dark';

const KEY = 'admin-theme';
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

function readStored(): AdminTheme {
  try {
    return localStorage.getItem(KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function useAdminTheme() {
  const [theme, setTheme] = useState<AdminTheme>('light');
  const [ready, setReady] = useState(false);

  useIsoLayoutEffect(() => {
    const root = document.documentElement;
    const siteWasDark = root.classList.contains('dark');
    const initial = readStored();
    setTheme(initial);
    setReady(true);
    root.classList.toggle('dark', initial === 'dark');
    root.style.colorScheme = initial;

    return () => {
      // Hand the root back to the public site theme (next-themes).
      root.classList.toggle('dark', siteWasDark);
      root.style.colorScheme = siteWasDark ? 'dark' : 'light';
    };
  }, []);

  // next-themes' provider effect can run after ours on first load; re-assert.
  useEffect(() => {
    if (!ready) return;
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
  }, [ready, theme]);

  const apply = useCallback((next: AdminTheme) => {
    setTheme(next);
    const root = document.documentElement;
    root.classList.toggle('dark', next === 'dark');
    root.style.colorScheme = next;
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = useCallback(() => apply(theme === 'dark' ? 'light' : 'dark'), [apply, theme]);

  return { theme, toggle, ready };
}
