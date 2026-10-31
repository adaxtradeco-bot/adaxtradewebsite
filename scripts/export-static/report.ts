/**
 * Export report (Req 10): report.json, console summary and exit-code rules.
 */

import fs from 'fs';
import path from 'path';
import type { AssetReport, BrokenRef } from './assets';
import type { RenderResult } from './prerender';
import type { Lang } from './types';

export interface DbPageRow {
  id: string;
  slug: string;
  language: string;
  status: string;
}

export interface ExternalHost {
  host: string;
  /** Unique URLs on this host. */
  urls: number;
}

export interface VerifySummary {
  pages: number;
  errors: Array<{ path: string; message: string }>;
  warnings: Array<{ path: string; message: string }>;
}

export interface NotExportedPage {
  slug: string;
  language: string;
  status: string;
  reason: string;
}

export interface ExportReport {
  startedAt: string;
  elapsedMs: number;
  perLanguage: Record<string, { exported: number; skipped: number }>;
  skipped: Array<{ path: string; lang: string; reason: string }>;
  failed: Array<{ path: string; reason: string }>;
  notExported: NotExportedPage[];
  media: {
    copied: number;
    downloaded: number;
    broken: BrokenRef[];
    bytes: { copied: number; downloaded: number; total: number };
    external: ExternalHost[];
    /** Paths requested by the pages that also answer 404 on the live site. */
    knownMissing: string[];
  };
  warnings: string[];
  verify: VerifySummary;
  bundle: { files: number; bytes: number };
  zip: { path: string; bytes: number } | null;
}

export interface ReportInput {
  startedAt: Date;
  elapsedMs: number;
  langs: Lang[];
  kept: RenderResult[];
  skipped: RenderResult[];
  failed: RenderResult[];
  allPages: DbPageRow[];
  assets: AssetReport | null;
  external: ExternalHost[];
  knownMissing?: string[];
  warnings: string[];
  verify: VerifySummary | null;
  bundle: { files: number; bytes: number };
  zip: { path: string; bytes: number } | null;
}

const byText = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);

/** Pages stored in the database that did not end up in the Bundle, with the reason (Req 10.2). */
export function findNotExported(
  allPages: DbPageRow[],
  langs: string[],
  results: { kept: RenderResult[]; skipped: RenderResult[]; failed: RenderResult[] },
): NotExportedPage[] {
  const keptIds = new Set<string>();
  const skippedBy = new Map<string, string>();
  const failedBy = new Map<string, string>();
  for (const r of results.kept) if (r.route.pageId) keptIds.add(r.route.pageId);
  for (const r of results.skipped) if (r.route.pageId) skippedBy.set(r.route.pageId, r.reason ?? 'skipped');
  for (const r of results.failed) if (r.route.pageId) failedBy.set(r.route.pageId, r.reason ?? 'render failed');

  const out: NotExportedPage[] = [];
  for (const page of allPages) {
    if (keptIds.has(page.id)) continue;
    let reason: string;
    if (page.status !== 'published') reason = page.status === 'draft' ? 'draft' : `status-${page.status}`;
    else if (!langs.includes(page.language.toLowerCase())) reason = `language-not-exported (${page.language})`;
    else if (skippedBy.has(page.id)) reason = `skipped: ${skippedBy.get(page.id)}`;
    else if (failedBy.has(page.id)) reason = `render-failed: ${failedBy.get(page.id)}`;
    else reason = 'duplicate-path (another page already owns this route)';
    out.push({ slug: page.slug, language: page.language, status: page.status, reason });
  }
  return out.sort((a, b) => byText(a.language, b.language) || byText(a.slug, b.slug) || byText(a.status, b.status));
}

export function buildReport(input: ReportInput): ExportReport {
  const perLanguage: ExportReport['perLanguage'] = {};
  for (const lang of input.langs) {
    perLanguage[lang] = {
      exported: input.kept.filter((r) => r.route.lang === lang).length,
      skipped: input.skipped.filter((r) => r.route.lang === lang).length,
    };
  }
  const assets = input.assets;
  return {
    startedAt: input.startedAt.toISOString(),
    elapsedMs: input.elapsedMs,
    perLanguage,
    skipped: input.skipped
      .map((r) => ({ path: r.route.path, lang: r.route.lang, reason: r.reason ?? 'skipped' }))
      .sort((a, b) => byText(a.path, b.path)),
    failed: input.failed
      .map((r) => ({ path: r.route.path, reason: r.reason ?? 'render failed' }))
      .sort((a, b) => byText(a.path, b.path)),
    notExported: findNotExported(input.allPages, input.langs, input),
    media: {
      copied: assets?.copied.length ?? 0,
      downloaded: assets?.downloaded.length ?? 0,
      broken: assets?.broken ?? [],
      bytes: assets?.bytes ?? { copied: 0, downloaded: 0, total: 0 },
      external: input.external,
      knownMissing: input.knownMissing ?? [],
    },
    warnings: [
      ...input.warnings,
      ...input.skipped
        .filter((r) => r.reason === 'empty-page')
        .map((r) => `Skipped empty page (no sections): ${r.route.path}`),
    ],
    verify: input.verify ?? { pages: 0, errors: [], warnings: [] },
    bundle: input.bundle,
    zip: input.zip,
  };
}

/** 0 only when nothing failed to render, no media is broken (unless allowed) and verification passed. */
export function exitCode(report: ExportReport, opts: { allowMissingMedia: boolean }): number {
  if (report.failed.length > 0) return 1;
  if (report.media.broken.length > 0 && !opts.allowMissingMedia) return 1;
  if (report.verify.errors.length > 0) return 1;
  return 0;
}

export function writeReport(report: ExportReport, outDir: string): string {
  const file = path.join(outDir, 'report.json');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(report, null, 2), 'utf8');
  return file;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDuration(ms: number): string {
  const s = Math.round(ms / 1000);
  return s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`;
}

const LIST_LIMIT = 15;

function listLines(items: string[], indent = '    '): string[] {
  const lines = items.slice(0, LIST_LIMIT).map((t) => `${indent}${t}`);
  if (items.length > LIST_LIMIT) lines.push(`${indent}... and ${items.length - LIST_LIMIT} more (see report.json)`);
  return lines;
}

export function formatSummary(report: ExportReport, opts: { allowMissingMedia: boolean }): string {
  const lines: string[] = ['', 'Static export summary', '---------------------'];
  for (const [lang, c] of Object.entries(report.perLanguage)) {
    lines.push(`  ${lang}: ${c.exported} exported, ${c.skipped} skipped`);
  }
  if (report.skipped.length > 0) {
    lines.push('  Skipped routes:', ...listLines(report.skipped.map((s) => `${s.path}  (${s.reason})`)));
  }
  if (report.failed.length > 0) {
    lines.push('  FAILED routes:', ...listLines(report.failed.map((f) => `${f.path}  (${f.reason})`)));
  }
  if (report.notExported.length > 0) {
    lines.push(
      `  Pages in the database not exported: ${report.notExported.length}`,
      ...listLines(report.notExported.map((p) => `[${p.language}] ${p.slug}  (${p.reason})`)),
    );
  }

  const m = report.media;
  lines.push(
    `  Media: ${m.copied} copied (${formatBytes(m.bytes.copied)}), ${m.downloaded} downloaded (${formatBytes(m.bytes.downloaded)}), ` +
      `total ${formatBytes(m.bytes.total)}, ${m.broken.length} broken`,
  );
  if (m.broken.length > 0) {
    lines.push(...listLines(m.broken.map((b) => `${b.ref}  (in ${b.from}${b.reason ? `: ${b.reason}` : ''})`)));
  }
  if (m.knownMissing.length > 0) {
    lines.push(`  Also missing on the live site (404): ${m.knownMissing.join(', ')}`);
  }
  if (m.external.length > 0) {
    lines.push(`  External media hosts (not copied): ${m.external.map((e) => `${e.host} (${e.urls})`).join(', ')}`);
  }
  if (report.warnings.length > 0) {
    lines.push(`  Warnings: ${report.warnings.length}`, ...listLines(report.warnings));
  }

  const v = report.verify;
  lines.push(`  Verify: ${v.pages} pages, ${v.errors.length} errors, ${v.warnings.length} warnings`);
  if (v.errors.length > 0) lines.push(...listLines(v.errors.map((e) => `${e.path}: ${e.message}`)));

  lines.push(`  Bundle: ${report.bundle.files} files, ${formatBytes(report.bundle.bytes)}`);
  if (report.zip) lines.push(`  Zip: ${report.zip.path} (${formatBytes(report.zip.bytes)})`);
  lines.push(`  Elapsed: ${formatDuration(report.elapsedMs)}`);

  const code = exitCode(report, opts);
  lines.push(
    code === 0
      ? '  Result: OK'
      : `  Result: FAILED (exit ${code}); the Bundle folder was kept for inspection${report.zip ? ' and the zip is marked WITH-ERRORS' : ', no zip was created'}.`,
  );
  return lines.join('\n');
}

const MEDIA_EXT = /\.(?:png|jpe?g|gif|webp|avif|svg|ico|mp4|webm|woff2?|ttf|otf|pdf)$/i;
const ABSOLUTE_URL = /https?:\/\/([a-z0-9.-]+)(?::\d+)?\/[^\s"'<>)\\]*/gi;
const VERCEL_BLOB = /(^|\.)blob\.vercel-storage\.com$/i;

/** Absolute media URLs on hosts other than Vercel Blob (those are downloaded and rewritten). */
export function findExternalMedia(text: string, into = new Map<string, Set<string>>()): Map<string, Set<string>> {
  for (const m of text.replace(/\\\//g, '/').matchAll(ABSOLUTE_URL)) {
    const host = m[1].toLowerCase();
    if (VERCEL_BLOB.test(host)) continue;
    const url = m[0].replace(/[?#].*$/s, '');
    if (!MEDIA_EXT.test(url) && !/\/(?:image|video)\/upload\//i.test(url)) continue;
    const set = into.get(host) ?? new Set<string>();
    set.add(url);
    into.set(host, set);
  }
  return into;
}

export function scanExternalHosts(bundleDir: string): ExternalHost[] {
  const hosts = new Map<string, Set<string>>();
  const walk = (dir: string, rel: string): void => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const childRel = rel ? `${rel}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        if (childRel !== '_next') walk(path.join(dir, entry.name), childRel);
      } else if (entry.isFile() && (/\.(?:html|css)$/i.test(entry.name) || (rel.startsWith('_data') && entry.name.endsWith('.json')))) {
        findExternalMedia(fs.readFileSync(path.join(dir, entry.name), 'utf8'), hosts);
      }
    }
  };
  walk(path.resolve(bundleDir), '');
  return [...hosts]
    .map(([host, urls]) => ({ host, urls: urls.size }))
    .sort((a, b) => b.urls - a.urls || byText(a.host, b.host));
}
