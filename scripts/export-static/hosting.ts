/**
 * Hosting files: .htaccess, root index.html and README-DEPLOY.txt.
 * Pure renderers plus the default-language lookup (mirrors src/app/page.tsx).
 */
import fs from 'fs';
import path from 'path';
import { languages, supportedLanguages } from '../../src/lib/i18n/config';

const FALLBACK_LANG = 'fa';
const TEMPLATE_DIR = path.resolve(__dirname, '../../export-template');

export interface SiteSettingsClient {
  siteSettings: { findFirst(): Promise<{ data: string } | null> };
}

export interface ReadmeInfo {
  exportedAt: string;
  routeCount: number;
  fileCount: number;
  perLanguage: Record<string, number>;
  defaultLang: string;
}

const readTemplate = (name: string): string =>
  fs.readFileSync(path.join(TEMPLATE_DIR, name), 'utf8');

function safeLang(lang: string): string {
  return supportedLanguages.includes(lang) ? lang : FALLBACK_LANG;
}

const escapeHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function renderHtaccess(defaultLang: string): string {
  return readTemplate('htaccess.txt').split('__DEFAULT_LANG__').join(safeLang(defaultLang));
}

export function renderRootIndex(defaultLang: string, baseUrl?: string): string {
  const lang = safeLang(defaultLang);
  const dir = languages[lang].dir;
  const target = `/${lang}/`;
  const canonical = baseUrl
    ? `  <link rel="canonical" href="${escapeHtml(baseUrl.replace(/\/+$/, ''))}${target}">\n`
    : '';
  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Redirecting...</title>
  <meta http-equiv="refresh" content="0; url=${target}">
${canonical}  <script>location.replace(${JSON.stringify(target)});</script>
</head>
<body>
  <noscript><a href="${target}">${target}</a></noscript>
</body>
</html>
`;
}

export function renderReadme(info: ReadmeInfo): string {
  const perLanguage = Object.entries(info.perLanguage)
    .map(([lang, count]) => `    ${lang}: ${count}`)
    .join('\n');
  const values: Record<string, string> = {
    exportedAt: info.exportedAt,
    routeCount: String(info.routeCount),
    fileCount: String(info.fileCount),
    perLanguage,
    defaultLang: safeLang(info.defaultLang),
  };
  return readTemplate('README-DEPLOY.txt').replace(/\{\{(\w+)\}\}/g, (m, key: string) =>
    key in values ? values[key] : m,
  );
}

export async function getDefaultLanguage(prisma: SiteSettingsClient): Promise<string> {
  try {
    const settings = await prisma.siteSettings.findFirst();
    if (settings) {
      const saved = JSON.parse(settings.data);
      return safeLang(saved?.languages?.defaultLanguage || FALLBACK_LANG);
    }
  } catch {
    // fall through to the fallback
  }
  return FALLBACK_LANG;
}
