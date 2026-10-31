/**
 * Hydration spike (Task 9): export three representative pages, serve them statically and,
 * with --measure, report what the browser does when React hydrates the pre-rendered DOM.
 *
 *   npx tsx scripts/export-static/spike.ts [--measure]
 */

import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { chromium, type Page } from 'playwright';
import { loadEnv, runPreflight } from './preflight';
import { startExportServer } from './build';
import { prerenderAll, ApiSnapshot } from './prerender';
import { assembleMinimal } from './assemble';
import { serveBundle } from './static-server';
import { MAIN_TIMELINE_INIT_SCRIPT as INIT_SCRIPT, findBadIntervals } from './verify';
import { normalizeSlugToPath } from './routes';
import type { RouteEntry } from './types';

const OUT = path.resolve('dist-static', 'spike', 'bundle');
const SERVE_PORT = 4000;

async function pickBuilderPath(prisma: PrismaClient, exclude: string[]): Promise<string> {
  const pages = await prisma.page.findMany({
    where: { status: 'published', language: 'en', isBuilderPage: true },
    select: { slug: true, language: true, builderData: true },
  });
  const candidates = pages
    .map((p) => ({ path: normalizeSlugToPath(p.slug, p.language), data: p.builderData ?? '' }))
    .filter((p) => !exclude.includes(p.path) && p.path !== '/en');
  const hasSlider = (raw: string): boolean => {
    try {
      const parsed = JSON.parse(raw);
      const list: unknown[] = Array.isArray(parsed) ? parsed : (parsed?.sections ?? []);
      return list.some((s) => /slider/i.test(String((s as { type?: unknown })?.type ?? '')));
    } catch {
      return false;
    }
  };
  const pick = candidates.find((c) => hasSlider(c.data)) ?? candidates[0];
  if (!pick) throw new Error('No published English builder page found.');
  console.log(`Builder page: ${pick.path} (${hasSlider(pick.data) ? 'has slider section' : 'no slider section found'})`);
  return pick.path;
}

interface PageReport {
  path: string;
  htmlLang: string | null;
  htmlDir: string | null;
  headingInRawHtml: { heading: string; present: boolean } | null;
  consoleErrors: string[];
  consoleWarnings: string[];
  hydrationMessages: string[];
  forbiddenRequests: string[];
  mainTimeline: Array<{ t: number; state: string; children: number }>;
  badIntervalsAfterFirstContent: Array<{ state: string; fromMs: number; durationMs: number }>;
  initialNonContentMs: number | null;
}

async function measurePage(page: Page, baseUrl: string, routePath: string): Promise<PageReport> {
  const consoleErrors: string[] = [];
  const consoleWarnings: string[] = [];
  const forbidden: string[] = [];
  const onConsole = (m: import('playwright').ConsoleMessage): void => {
    if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 400));
    else if (m.type() === 'warning') consoleWarnings.push(m.text().slice(0, 400));
  };
  const onPageError = (e: Error): void => {
    consoleErrors.push(`pageerror: ${e.message.slice(0, 400)}`);
  };
  const onRequest = (r: import('playwright').Request): void => {
    const u = new URL(r.url());
    if (u.origin !== baseUrl || u.pathname.startsWith('/api/') || u.pathname.startsWith('/_next/image')) {
      if (!u.protocol.startsWith('data') && !u.protocol.startsWith('blob')) forbidden.push(`${r.method()} ${r.url()}`);
    }
  };
  page.on('console', onConsole);
  page.on('pageerror', onPageError);
  page.on('request', onRequest);

  await page.goto(`${baseUrl}${routePath}`, { waitUntil: 'domcontentloaded' });
  // remote videos keep the network busy, so idle is best-effort
  await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => undefined);
  await page.waitForTimeout(1500);

  const timeline: PageReport['mainTimeline'] = await page.evaluate(() => (window as any).__mainLog ?? []);
  const end: number = await page.evaluate(() => Math.round(performance.now()));
  const firstContent = timeline.findIndex((e) => e.state === 'content');
  const bad = findBadIntervals(timeline, end);

  const info = await page.evaluate(() => ({
    lang: document.documentElement.getAttribute('lang'),
    dir: document.documentElement.getAttribute('dir'),
    heading: (document.querySelector('main h1, main h2') as HTMLElement | null)?.innerText.trim() ?? '',
  }));
  const raw = await (await fetch(`${baseUrl}${routePath}`)).text();
  const escaped = info.heading.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/'/g, '&#x27;');
  const present = !!info.heading && (raw.includes(info.heading) || raw.includes(escaped));

  page.off('console', onConsole);
  page.off('pageerror', onPageError);
  page.off('request', onRequest);

  return {
    path: routePath,
    htmlLang: info.lang,
    htmlDir: info.dir,
    headingInRawHtml: info.heading ? { heading: info.heading.slice(0, 80), present } : null,
    consoleErrors,
    consoleWarnings,
    hydrationMessages: [...consoleErrors, ...consoleWarnings].filter((t) =>
      /hydrat|did not match|text content does not match|#4(18|23|25)/i.test(t),
    ),
    forbiddenRequests: forbidden,
    mainTimeline: timeline,
    badIntervalsAfterFirstContent: bad,
    initialNonContentMs: firstContent > 0 ? timeline[firstContent].t : firstContent === 0 ? 0 : null,
  };
}

async function mobileMenuCheck(baseUrl: string, routePath: string): Promise<Record<string, unknown>> {
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message.slice(0, 300)));
    await page.goto(`${baseUrl}${routePath}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    const button = page.locator('header button[aria-label*="menu" i], button[aria-label*="menu" i]').first();
    if ((await button.count()) === 0) return { path: routePath, menuButton: 'not found' };
    const before = await page.locator('a:visible').count();
    await button.click();
    await page.waitForTimeout(500);
    const after = await page.locator('a:visible').count();
    return { path: routePath, menuButton: 'clicked', visibleLinksBefore: before, visibleLinksAfter: after, pageErrors: errors };
  } finally {
    await browser.close();
  }
}

async function main(): Promise<void> {
  const measure = process.argv.includes('--measure');
  loadEnv();
  const problems = await runPreflight();
  if (problems.length > 0) {
    for (const p of problems) console.error(`${p.problem}\n  ${p.fix}`);
    process.exit(1);
  }

  const prisma = new PrismaClient();
  let builderPath: string;
  try {
    builderPath = await pickBuilderPath(prisma, ['/en/fleet-management']);
  } finally {
    await prisma.$disconnect();
  }

  // fleet-management is a server component that needs a Page row with slug 'fleet-management';
  // when the database has none it 404s, so fall back to other server-rendered routes.
  const serverRoutes = ['/en/fleet-management', '/en/industries', '/en/showcase', '/en/contact'];
  const candidates: RouteEntry[] = [
    { lang: 'en', path: '/en', source: 'fs' },
    { lang: 'en', path: builderPath, source: 'db' },
    ...serverRoutes.map((p): RouteEntry => ({ lang: 'en', path: p, source: 'fs' })),
  ];

  fs.rmSync(path.resolve('dist-static', 'spike'), { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });

  const exportServer = await startExportServer(3999);
  let results;
  try {
    results = await prerenderAll(candidates, exportServer.baseUrl, { concurrency: 3, outDir: OUT, verbose: true });
  } finally {
    await exportServer.stop();
  }

  const serverPick = serverRoutes.find((p) => results.find((r) => r.route.path === p)?.ok);
  const wanted = new Set(['/en', builderPath, serverPick]);
  for (const r of results) {
    if (r.ok && !wanted.has(r.route.path)) {
      fs.rmSync(path.join(OUT, r.file!), { force: true });
      r.ok = false;
      r.skipped = true;
      r.reason = 'spike: not selected';
    }
  }
  const routes = candidates.filter((c) => wanted.has(c.path));
  console.log(`Spike routes: ${routes.map((r) => r.path).join(', ')}`);

  const snapshot = new ApiSnapshot();
  snapshot.addResults(results);
  assembleMinimal(OUT, { results, snapshot });
  for (const w of snapshot.warnings) console.warn(w);
  console.log(`Snapshot: ${snapshot.size} API responses`);

  const failed = results.filter((r) => !r.ok && !r.skipped);
  if (failed.length > 0 || routes.length < 3) {
    for (const f of failed) console.error(`Not exported: ${f.route.path} (${f.reason})`);
    console.error('Need three exportable routes.');
    process.exit(1);
  }

  const server = await serveBundle(OUT, SERVE_PORT);
  console.log(`Serving bundle at ${server.url}`);

  if (!measure) {
    console.log('Press Ctrl+C to stop.');
    return;
  }

  const browser = await chromium.launch();
  const reports: PageReport[] = [];
  try {
    for (const route of routes) {
      const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
      await context.addInitScript(INIT_SCRIPT);
      const page = await context.newPage();
      reports.push(await measurePage(page, server.url, route.path));
      await context.close();
    }
  } finally {
    await browser.close();
  }
  const menu = await mobileMenuCheck(server.url, routes[0].path);
  const log = server.getRequestLog();
  const summary = {
    pages: reports,
    mobileMenu: menu,
    serverRequests: {
      total: log.length,
      non2xx: log.filter((r) => r.status >= 400).map((r) => `${r.method} ${r.url} ${r.status}`),
      apiOrImageHits: log.filter((r) => r.url.startsWith('/api/') || r.url.startsWith('/_next/image')).map((r) => r.url),
    },
  };
  console.log(JSON.stringify(summary, null, 2));
  await server.stop();
}

main()
  .then(() => {
    if (process.argv.includes('--measure')) process.exit(0);
  })
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  });
