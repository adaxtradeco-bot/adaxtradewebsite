import { describe, it, expect } from 'vitest';
import {
  renderHtaccess,
  renderRootIndex,
  renderReadme,
  getDefaultLanguage,
} from '../hosting';

describe('renderHtaccess', () => {
  it('substitutes the default language everywhere', () => {
    const out = renderHtaccess('en');
    expect(out).not.toContain('__DEFAULT_LANG__');
    expect(out).toContain('/en/$1 [R=302,L]');
  });

  it('falls back to fa for unknown languages', () => {
    expect(renderHtaccess('xx')).toContain('/fa/$1 [R=302,L]');
  });

  it('denies sensitive files and keeps core directives', () => {
    const out = renderHtaccess('fa');
    expect(out).toContain('Options -Indexes');
    expect(out).toContain('ErrorDocument 404 /404.html');
    expect(out).toContain('Require all denied');
    expect(out).toContain('Deny from all');
    expect(out).toContain('^(config|lib)\\.php$');
    expect(out).toContain('_ratelimit');
    expect(out).toContain('AddDefaultCharset UTF-8');
  });
});

describe('renderRootIndex', () => {
  it('uses rtl for fa and ltr for en', () => {
    expect(renderRootIndex('fa')).toContain('<html lang="fa" dir="rtl">');
    expect(renderRootIndex('en')).toContain('<html lang="en" dir="ltr">');
  });

  it('has refresh, JS fallback and noscript link', () => {
    const out = renderRootIndex('en');
    expect(out).toContain('<meta http-equiv="refresh" content="0; url=/en/">');
    expect(out).toContain('location.replace("/en/")');
    expect(out).toContain('<noscript><a href="/en/">');
  });

  it('adds canonical only with baseUrl', () => {
    expect(renderRootIndex('en')).not.toContain('canonical');
    expect(renderRootIndex('en', 'https://example.com/')).toContain(
      '<link rel="canonical" href="https://example.com/en/">',
    );
  });

  it('falls back to fa for unknown language', () => {
    expect(renderRootIndex('zz')).toContain('url=/fa/');
  });
});

describe('renderReadme', () => {
  it('replaces all placeholders', () => {
    const out = renderReadme({
      exportedAt: '2026-01-02 10:00',
      routeCount: 12,
      fileCount: 345,
      perLanguage: { fa: 7, en: 5 },
      defaultLang: 'fa',
    });
    expect(out).not.toContain('{{');
    expect(out).toContain('2026-01-02 10:00');
    expect(out).toContain('345');
    expect(out).toContain('fa: 7');
    expect(out).toContain('try_files $uri $uri/ =404;');
  });
});

describe('getDefaultLanguage', () => {
  const make = (data: string | null, fail = false) => ({
    siteSettings: {
      findFirst: async () => {
        if (fail) throw new Error('db');
        return data === null ? null : { data };
      },
    },
  });

  it('reads languages.defaultLanguage', async () => {
    expect(await getDefaultLanguage(make('{"languages":{"defaultLanguage":"en"}}'))).toBe('en');
  });

  it('falls back to fa on missing, invalid or error', async () => {
    expect(await getDefaultLanguage(make(null))).toBe('fa');
    expect(await getDefaultLanguage(make('{}'))).toBe('fa');
    expect(await getDefaultLanguage(make('not json'))).toBe('fa');
    expect(await getDefaultLanguage(make('{"languages":{"defaultLanguage":"xx"}}'))).toBe('fa');
    expect(await getDefaultLanguage(make(null, true))).toBe('fa');
  });
});
