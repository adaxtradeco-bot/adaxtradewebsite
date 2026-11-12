/**
 * Resolves the site's default language from Site Settings (database).
 *
 * Shared by the root redirect (src/app/page.tsx) and the default-language API,
 * so every entry point agrees on which language "/" sends visitors to.
 */

import { prisma } from '@/lib/prisma';
import { defaultLanguage as CONFIG_DEFAULT, supportedLanguages } from './config';

export const FALLBACK_LANGUAGE = CONFIG_DEFAULT;

function isSupported(lang: unknown): lang is string {
  return typeof lang === 'string' && supportedLanguages.includes(lang);
}

/**
 * Picks the language "/" should redirect to from a parsed settings object.
 * - the saved defaultLanguage, if it is a supported language;
 * - otherwise the first supported enabled language;
 * - otherwise the config default.
 */
export function pickDefaultLanguage(saved: any): string {
  const languages = saved?.languages;
  const chosen = languages?.defaultLanguage;
  if (isSupported(chosen)) return chosen;

  const enabled: unknown[] = Array.isArray(languages?.enabledLanguages)
    ? languages.enabledLanguages
    : [];
  const firstEnabled = enabled.find(isSupported);
  return (firstEnabled as string | undefined) ?? FALLBACK_LANGUAGE;
}

/** Reads Site Settings and returns the default language (never throws). */
export async function getSiteDefaultLanguage(): Promise<string> {
  try {
    const settings = await prisma.siteSettings.findFirst();
    if (!settings) return FALLBACK_LANGUAGE;
    return pickDefaultLanguage(JSON.parse(settings.data));
  } catch (error) {
    console.error('Failed to fetch default language:', error);
    return FALLBACK_LANGUAGE;
  }
}
