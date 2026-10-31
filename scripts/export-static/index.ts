/**
 * Static site export CLI: `npm run export:static [-- flags]`.
 * Pipeline: preflight -> build -> serve -> prerender -> equivalents/sitemap -> assemble ->
 * assets -> verify -> zip -> report. See .kiro/specs/static-site-export/design.md.
 */

import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { parseArgs, type ExportOptions } from './cli';
import { maskSecrets, runPreflight } from './preflight';
import { applySiteProfile } from './sites';
import { buildExport, startExportServer, type ExportServer } from './build';
import { blogFeedPaths, buildInitialRoutes, hasNoSections, scanFilesystemRoutes } from './routes';
import { ApiSnapshot, exportBlogFeeds, renderCrawl } from './prerender';
import { buildEquivalents, fetchPublishedPages } from './equivalents';
import { deriveTitle, injectCanonical, injectPageMeta, renderRobots, renderSitemap } from './sitemap';
import { getDefaultLanguage } from './hosting';
import { renderNotFoundPage } from './notfound';
import { assembleFull, bundleStats, createZip, findForbiddenFiles, writeReadme } from './assemble';
import { processAssets, type AssetReport } from './assets';
import { verifyBundle } from './verify';
import { serveBundle } from './static-server';
import {
  buildReport,
  exitCode,
  formatSummary,
  scanExternalHosts,
  writeReport,
  type DbPageRow,
  type VerifySummary,
} from './report';
import type { Lang } from './types';

const EXPORT_PORT = 3999;
const SERVE_PORT = 4000;
const EXPORTABLE_LANGS: Lang[] = ['fa', 'en', 'ar'];

const log = (message: string): void => console.log(message);

function stamp(date: Date): string {
  const p = (n: number): string => String(n).padStart(2, '0');
  return `${date.getFullYear()}${p(date.getMonth() + 1)}${p(date.getDate())}-${p(date.getHours())}${p(date.getMinutes())}`;
}

function parseLangs(opts: ExportOptions): Lang[] {
  const unsupported = opts.langs.filter((l) => !EXPORTABLE_LANGS.includes(l as Lang));
  if (unsupported.length > 0) {
    throw new Error(`Unsupported --langs value(s): ${unsupported.join(', ')} (supported: ${EXPORTABLE_LANGS.join(', ')})`);
  }
  return opts.langs as Lang[];
}

async function waitForInterrupt(): Promise<void> {
  // Replace the child.ts handler (which exits with 130) so the server can stop cleanly.
  process.removeAllListeners('SIGINT');
  await new Promise<void>((resolve) => process.once('SIGINT', () => resolve()));
}

async function run(): Promise<number> {
  const startedAt = new Date();
  let opts: ExportOptions;
  let langs: Lang[];
  try {
    const argv = process.argv.slice(2);
    opts = applySiteProfile(parseArgs(argv), argv);
    langs = parseLangs(opts);
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err));
    return 2;
  }
  if (opts.site) {
    log(`Site: ${opts.site} | env: ${opts.envFile ?? '.env'} | address: ${opts.baseUrl ?? '(none)'} | output: ${opts.out}`);
  }

  log('1/9 Preflight');
  const problems = await runPreflight(opts);
  if (problems.length > 0) {
    for (const p of problems) console.error(`  - ${p.problem}\n    Fix: ${p.fix}`);
    return 1;
  }

  const outDir = path.resolve(opts.out);
  const bundleDir = path.join(outDir, 'bundle');
  fs.rmSync(bundleDir, { recursive: true, force: true });
  fs.mkdirSync(bundleDir, { recursive: true });
  const warnings: string[] = [];

  log(opts.skipBuild ? '2/9 Build (skipped)' : '2/9 Build (STATIC_EXPORT=1 next build)');
  await buildExport(opts);

  const prisma = new PrismaClient();
  let server: ExportServer | undefined;
  try {
    // Lets the owner see at a glance which site's database is being exported.
    const dbCounts = await prisma.page.groupBy({ by: ['language'], where: { status: 'published' }, _count: true });
    log(`Database: published pages ${dbCounts.map((c) => `${c.language}=${c._count}`).sort().join(', ') || '(none)'}`);
    log(`3/9 Starting export server on :${EXPORT_PORT}`);
    server = await startExportServer(EXPORT_PORT, opts);

    log('4/9 Prerendering routes');
    const initial = await buildInitialRoutes(prisma, langs);
    const renderLangs = [...new Set(initial.map((r) => r.lang))];
    for (const lang of renderLangs) log(`  ${lang}: ${initial.filter((r) => r.lang === lang).length} initial routes`);
    const builderRows = await prisma.page.findMany({
      where: { status: 'published', language: { in: renderLangs } },
      select: { id: true, builderData: true, sections: true },
    });
    // A Page row without sections is only empty when no filesystem route renders that path itself
    // (e.g. /en/contact is a static page even though its DB row has no sections).
    const fsRoutes = new Set(scanFilesystemRoutes().map((rel) => rel.toLowerCase()));
    const pagePath = new Map(initial.filter((r) => r.pageId).map((r) => [r.pageId as string, r.path]));
    const isFsPath = (id: string) => {
      const rest = (pagePath.get(id) ?? '').split('/').slice(2).join('/').toLowerCase();
      return fsRoutes.has(rest);
    };
    const emptyRows = builderRows.filter(hasNoSections);
    const emptyPageIds = new Set(emptyRows.filter((p) => !isFsPath(p.id)).map((p) => p.id));
    const softEmptyPageIds = new Set(emptyRows.filter((p) => isFsPath(p.id)).map((p) => p.id));
    const outcome = await renderCrawl(initial, server.baseUrl, {
      emptyPageIds,
      softEmptyPageIds,
      concurrency: opts.concurrency,
      outDir: bundleDir,
      verbose: opts.verbose,
      langs: renderLangs,
    });
    log(`  rendered: ${outcome.kept.length} kept, ${outcome.skipped.length} skipped, ${outcome.failed.length} failed`);

    const feeds = await exportBlogFeeds(server.baseUrl, bundleDir, blogFeedPaths(renderLangs));
    if (feeds.written.length > 0) log(`  blog RSS: ${feeds.written.length} feed(s)`);
    warnings.push(...feeds.warnings);

    const defaultLang = await getDefaultLanguage(prisma);
    log(`  rendering 404.html (${defaultLang})`);
    let notFoundHtml: string;
    try {
      notFoundHtml = await renderNotFoundPage(server.baseUrl, defaultLang);
    } finally {
      await server.stop();
    }

    log('5/9 Equivalents, sitemap and assemble');
    const allPages: DbPageRow[] = await prisma.page.findMany({
      select: { id: true, slug: true, language: true, status: true },
    });
    for (const lang of renderLangs) {
      const published = allPages.filter((p) => p.status === 'published' && p.language === lang).length;
      if (published > 0 && !outcome.kept.some((r) => r.route.lang === lang)) {
        outcome.failed.push({
          route: { lang, path: `/${lang}`, source: 'fs' },
          ok: false,
          reason: `no route exported although ${published} published page(s) exist`,
          apiCalls: [],
          links: [],
        });
      }
    }

    const published = await fetchPublishedPages(prisma, renderLangs);
    const keptRoutes = outcome.kept.map((r) => r.route);
    const equivalents = buildEquivalents(published, keptRoutes);

    // The live app does not emit <title>/description for builder pages; add them from the database.
    const metaRows = await prisma.page.findMany({
      where: { status: 'published', language: { in: renderLangs } },
      select: { id: true, title: true, metaTitle: true, metaDescription: true },
    });
    const metaById = new Map(metaRows.map((m) => [m.id, m]));
    for (const r of outcome.kept) {
      if (!r.file) continue;
      const file = path.join(bundleDir, r.file);
      let html = fs.readFileSync(file, 'utf8');
      const row = r.route.pageId ? metaById.get(r.route.pageId) : undefined;
      html = injectPageMeta(html, {
        title: row?.metaTitle || row?.title || deriveTitle(html, r.route.path),
        description: row?.metaDescription || undefined,
      });
      if (opts.baseUrl) html = injectCanonical(html, `${opts.baseUrl}${r.route.path}`);
      fs.writeFileSync(file, html, 'utf8');
    }

    const snapshot = new ApiSnapshot();
    snapshot.addResults(outcome.kept);
    warnings.push(...snapshot.warnings);

    const ctx = assembleFull(bundleDir, {
      results: outcome.kept,
      snapshot,
      equivalents,
      defaultLang,
      baseUrl: opts.baseUrl,
      notFoundHtml,
    });

    log('6/9 Media and static assets');
    const assets: AssetReport = await processAssets({
      bundleDir: ctx.bundleDir,
      download: !opts.noMediaDownload,
      allowMissing: opts.allowMissingMedia,
    });
    warnings.push(...assets.warnings);
    const external = scanExternalHosts(bundleDir);
    if (external.length > 0) {
      warnings.push(
        `External media hosts left as remote references: ${external.map((e) => `${e.host} (${e.urls} URLs)`).join(', ')}`,
      );
    }

    const sitemap = renderSitemap(equivalents.routes, equivalents, opts.baseUrl);
    if (sitemap) fs.writeFileSync(path.join(bundleDir, 'sitemap.xml'), sitemap, 'utf8');
    else warnings.push('sitemap.xml was not generated: pass --base-url=https://your-domain to create it.');
    const robotsSource = path.resolve('public', 'robots.txt');
    const existingRobots = fs.existsSync(robotsSource) ? fs.readFileSync(robotsSource, 'utf8') : undefined;
    if (existingRobots !== undefined || opts.baseUrl) {
      fs.writeFileSync(path.join(bundleDir, 'robots.txt'), renderRobots(opts.baseUrl, existingRobots ?? ''), 'utf8');
    }

    const perLanguage: Record<string, number> = {};
    for (const lang of renderLangs) perLanguage[lang] = outcome.kept.filter((r) => r.route.lang === lang).length;
    writeReadme(bundleDir, {
      exportedAt: startedAt.toISOString(),
      routeCount: outcome.kept.length,
      fileCount: bundleStats(bundleDir).files + 1,
      perLanguage,
      defaultLang,
    });

    const forbidden = findForbiddenFiles(bundleDir);
    if (forbidden.length > 0) {
      throw new Error(`Forbidden file(s) found in the Bundle (kept at ${bundleDir}): ${forbidden.slice(0, 5).join(', ')}`);
    }

    log(`7/9 Verifying ${equivalents.routes.length} pages on a plain static server`);
    let verify: VerifySummary;
    try {
      const v = await verifyBundle(bundleDir, equivalents.routes, {
        concurrency: opts.concurrency,
        verbose: opts.verbose,
        knownMissing: outcome.knownMissing,
      });
      verify = { pages: v.pages, errors: v.errors, warnings: v.warnings };
    } catch (err) {
      verify = {
        pages: 0,
        errors: [{ path: '(verify)', message: maskSecrets(err instanceof Error ? err.message : String(err)) }],
        warnings: [],
      };
    }

    const reportInput = {
      startedAt,
      elapsedMs: 0,
      langs: renderLangs,
      kept: outcome.kept,
      skipped: outcome.skipped,
      failed: outcome.failed,
      allPages,
      assets,
      external,
      knownMissing: outcome.knownMissing,
      warnings,
      verify,
      bundle: bundleStats(bundleDir),
      zip: null,
    };
    let report = buildReport({ ...reportInput, elapsedMs: Date.now() - startedAt.getTime() });
    const code = exitCode(report, opts);

    log('8/9 Zip');
    const zipPath = path.join(outDir, `site-${stamp(startedAt)}${code === 0 ? '' : '-WITH-ERRORS'}.zip`);
    const zipBytes = await createZip(bundleDir, zipPath, startedAt);
    report = buildReport({
      ...reportInput,
      elapsedMs: Date.now() - startedAt.getTime(),
      zip: { path: path.relative(process.cwd(), zipPath) || zipPath, bytes: zipBytes },
    });
    if (code !== 0) log('  the run has errors: the zip is marked WITH-ERRORS (the Bundle folder is kept for inspection)');

    log('9/9 Report');
    writeReport(report, outDir);
    log(formatSummary(report, opts));
    log(`\n  Report: ${path.join(opts.out, 'report.json')}`);

    if (opts.serve) {
      const bundleServer = await serveBundle(bundleDir, SERVE_PORT);
      log(`\nServing the Bundle at ${bundleServer.url} (Ctrl+C to stop)`);
      await waitForInterrupt();
      await bundleServer.stop();
    }
    return exitCode(report, opts);
  } finally {
    await server?.stop();
    await prisma.$disconnect().catch(() => undefined);
  }
}

run().then(
  (code) => process.exit(code),
  (err) => {
    console.error(`\nExport failed: ${maskSecrets(err instanceof Error ? err.message : String(err))}`);
    process.exit(1);
  },
);
