import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/prisma', () => ({ prisma: { siteSettings: { findFirst: vi.fn() } } }));

import { prisma } from '@/lib/prisma';
import { pickDefaultLanguage, getSiteDefaultLanguage, FALLBACK_LANGUAGE } from '@/lib/i18n/default-language';

const findFirst = prisma.siteSettings.findFirst as unknown as ReturnType<typeof vi.fn>;

describe('pickDefaultLanguage', () => {
  it.each(['en', 'ar', 'tr', 'fr', 'de', 'es', 'fa'])('returns the saved default "%s"', (lang) => {
    expect(pickDefaultLanguage({ languages: { defaultLanguage: lang } })).toBe(lang);
  });

  it('falls back to the first supported enabled language for an unknown default', () => {
    expect(
      pickDefaultLanguage({ languages: { defaultLanguage: 'xx', enabledLanguages: ['zz', 'de', 'en'] } }),
    ).toBe('de');
  });

  it('falls back to the config default when nothing usable is saved', () => {
    expect(pickDefaultLanguage(null)).toBe(FALLBACK_LANGUAGE);
    expect(pickDefaultLanguage({})).toBe(FALLBACK_LANGUAGE);
  });
});

describe('getSiteDefaultLanguage', () => {
  it('reads the current value from the database on every call', async () => {
    findFirst.mockResolvedValueOnce({ data: JSON.stringify({ languages: { defaultLanguage: 'fa' } }) });
    expect(await getSiteDefaultLanguage()).toBe('fa');
    findFirst.mockResolvedValueOnce({ data: JSON.stringify({ languages: { defaultLanguage: 'en' } }) });
    expect(await getSiteDefaultLanguage()).toBe('en');
  });

  it('returns the fallback when the database fails', async () => {
    findFirst.mockRejectedValueOnce(new Error('db down'));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(await getSiteDefaultLanguage()).toBe(FALLBACK_LANGUAGE);
  });
});
