/**
 * Prerender: renders routes of the running Export_Server in headless Chromium, saves the final
 * DOM as HTML and records every same-origin GET /api/* response for the API_Snapshot.
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';
import { languages } from '../../src/lib/i18n/config';
import { normalizeApiKey } from './api-key';
import { extractInternalLinks, isNotFoundMain, shouldSkipIdentical } from './routes';
import type { Lang, RouteEntry } from './types';

export interface CapturedCall {
  key: string;
  status: number;
  body: string;
}

export interface RenderResult {
  route: RouteEntry;
  ok: boolean;
  /** Not an error: the route does not exist (404 / not-found UI / identical-to-<lang>). */
  skipped?: boolean;
  /** Set when ok is false; for failures this is the error message. */
  reason?: string;
  mainTextHash?: string;
  apiCalls: CapturedCall[];
  /** Internal links found on the page, normalized to `/<lang>/...` paths. */
  links: string[];
  /** Relative path of the written file inside outDir (only when written). */
  file?: string;
  /** Same-origin paths (no query) that answered 404 while rendering this route. */
  missing?: string[];
  /** Serialized HTML; present until it has been written to disk. */
  html?: string;
}

export interface PrerenderOptions {
  concurrency: number;
  outDir: string;
  verbose: boolean;
}

const SETTLE_TIMEOUT_MS = 20_000;
const SETTLE_STABLE_MS = 300;
const NETWORK_IDLE_MS = 8_000;
const SHIM_TAG = '<script src="/static-shim.js"></script>';
const MAX_ROUTES = 2000;

const sha1 = (text: string): string => crypto.createHash('sha1').update(text).digest('hex');

/** `/en` -> en/index.html, `/en/a/b` -> en/a/b/index.html */
export function routeToFile(routePath: string): string {
  const segments = routePath.split('/').filter(Boolean);
  return path.posix.join(...segments, 'index.html');
}

export function injectShim(html: string): string {
  return html.replace(/<head(\s[^>]*)?>/i, (m) => `${m}${SHIM_TAG}`);
}

interface Worker {
  context: BrowserContext;
  page: Page;
}

async function renderOnce(worker: Worker, route: RouteEntry, baseUrl: string): Promise<RenderResult> {
  const { page } = worker;
  const origin = new URL(baseUrl).origin;
  const calls = new Map<string, CapturedCall>();
  const pending: Promise<void>[] = [];
  const missing = new Set<string>();

  const onResponse = (response: import('playwright').Response): void => {
    const req = response.request();
    if (req.method() !== 'GET') return;
    let url: URL;
    try {
      url = new URL(response.url());
    } catch {
      return;
    }
    if (
      response.status() === 404 &&
      url.origin === origin &&
      req.resourceType() !== 'document' &&
      !url.pathname.startsWith('/api/') &&
      !url.pathname.startsWith('/_next/image')
    ) {
      missing.add(url.pathname);
    }
    if (url.origin !== origin || !url.pathname.startsWith('/api/')) return;
    pending.push(
      response
        .text()
        .then((body) => {
          const key = normalizeApiKey(response.url());
          if (!calls.has(key)) calls.set(key, { key, status: response.status(), body });
        })
        .catch(() => undefined),
    );
  };
  page.on('response', onResponse);

  try {
    // Remote videos/images (Cloudinary, Vercel Blob) can keep the network busy for tens of seconds,
    // so networkidle is best-effort; the settle check below decides when the DOM is ready.
    const response = await page.goto(`${baseUrl}${route.path}`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await page.waitForLoadState('networkidle', { timeout: NETWORK_IDLE_MS }).catch(() => undefined);
    const httpStatus = response?.status() ?? 0;
    const base = { route, links: [] as string[] };
    const withMissing = <T extends RenderResult>(r: T): T => ({ ...r, missing: [...missing] });

    if (httpStatus === 404) {
      await Promise.all(pending);
      return withMissing({ ...base, ok: false, skipped: true, reason: 'http-404', apiCalls: [...calls.values()] });
    }

    // Settle: <main> has children and no spinner inside it, stable for 300ms.
    await page.waitForFunction(
      (stableMs: number) => {
        const w = window as unknown as { __okSince?: number };
        const main = document.querySelector('main');
        // Image/video placeholders inside sections also use .animate-spin; only a spinner in an
        // otherwise empty main means the page itself is still loading.
        const ready =
          !!main &&
          main.children.length > 0 &&
          (!main.querySelector('.animate-spin') || (main as HTMLElement).innerText.trim().length >= 200);
        if (!ready) {
          w.__okSince = 0;
          return false;
        }
        if (!w.__okSince) {
          w.__okSince = performance.now();
          return false;
        }
        return performance.now() - w.__okSince >= stableMs;
      },
      SETTLE_STABLE_MS,
      { timeout: SETTLE_TIMEOUT_MS, polling: 100 },
    );
    await page.waitForLoadState('networkidle', { timeout: NETWORK_IDLE_MS }).catch(() => undefined);
    await Promise.all(pending);

    const dir = languages[route.lang]?.dir ?? 'ltr';
    const info = await page.evaluate(
      ({ lang, dir }: { lang: string; dir: string }) => {
        document.documentElement.setAttribute('lang', lang);
        document.documentElement.setAttribute('dir', dir);
        const main = document.querySelector('main');
        return {
          mainText: (main as HTMLElement | null)?.innerText ?? '',
          hrefs: Array.from(document.querySelectorAll('a[href]')).map((a) => a.getAttribute('href') || ''),
        };
      },
      { lang: route.lang, dir },
    );

    const apiCalls = [...calls.values()];
    const isHome = route.path === `/${route.lang}`;
    const byslug404 = apiCalls.some(
      (c) =>
        c.status === 404 &&
        c.key.startsWith('/api/pages/by-slug') &&
        new URLSearchParams(c.key.split('?')[1] ?? '').get('slug')?.replace(/\/+$/, '').toLowerCase() ===
          route.path.toLowerCase(),
    );
    const mainText = info.mainText.trim();
    const links = extractInternalLinks(info.hrefs, baseUrl, Object.keys(languages) as Lang[]);

    if (!isHome && (byslug404 || isNotFoundMain(mainText))) {
      return withMissing({
        ...base,
        ok: false,
        skipped: true,
        reason: isNotFoundMain(mainText) ? 'not-found-ui' : 'by-slug-404',
        apiCalls,
        links,
      });
    }
    if (isNotFoundMain(mainText)) {
      return withMissing({ ...base, ok: false, reason: 'language home renders the not-found UI', apiCalls, links });
    }

    return withMissing({
      route,
      ok: true,
      mainTextHash: sha1(mainText),
      apiCalls,
      links,
      html: injectShim(await page.content()),
    });
  } finally {
    page.off('response', onResponse);
  }
}

async function renderRoute(worker: Worker, route: RouteEntry, baseUrl: string): Promise<RenderResult> {
  let lastError = '';
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      return await renderOnce(worker, route, baseUrl);
    } catch (err) {
      lastError = err instanceof Error ? err.message.split('\n')[0] : String(err);
      if (/waitForFunction: Timeout/.test(lastError)) {
        lastError = `<main> stayed empty or showed only a spinner for ${SETTLE_TIMEOUT_MS / 1000}s`;
      }
      // a hung page may be left half-loaded; navigation in the next attempt resets it
    }
  }
  return { route, ok: false, reason: `render failed: ${lastError}`, apiCalls: [], links: [] };
}

export function writeHtml(outDir: string, result: RenderResult): void {
  if (!result.ok || result.html === undefined) return;
  const file = routeToFile(result.route.path);
  const target = path.join(outDir, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, result.html, 'utf8');
  result.file = file;
  delete result.html;
}

/** Runs `fn` over a pool of browser pages. Handler gets the worker-bound renderer. */
async function withPool<T>(concurrency: number, fn: (render: (r: RouteEntry, baseUrl: string) => Promise<RenderResult>) => Promise<T>): Promise<T> {
  const browser: Browser = await chromium.launch();
  const workers: Worker[] = [];
  const free: Worker[] = [];
  const waiters: Array<(w: Worker) => void> = [];
  try {
    for (let i = 0; i < Math.max(1, concurrency); i++) {
      const context = await browser.newContext();
      const page = await context.newPage();
      const worker = { context, page };
      workers.push(worker);
      free.push(worker);
    }
    const acquire = (): Promise<Worker> => {
      const w = free.pop();
      return w ? Promise.resolve(w) : new Promise((resolve) => waiters.push(resolve));
    };
    const release = (w: Worker): void => {
      const next = waiters.shift();
      if (next) next(w);
      else free.push(w);
    };
    return await fn(async (route, baseUrl) => {
      const w = await acquire();
      try {
        return await renderRoute(w, route, baseUrl);
      } finally {
        release(w);
      }
    });
  } finally {
    await browser.close().catch(() => undefined);
  }
}

/** Simple entry point: render exactly these routes and write the HTML of the ok ones. */
export async function prerenderAll(routes: RouteEntry[], baseUrl: string, opts: PrerenderOptions): Promise<RenderResult[]> {
  return withPool(opts.concurrency, async (render) => {
    const results = await Promise.all(
      routes.map(async (route) => {
        const result = await render(route, baseUrl);
        writeHtml(opts.outDir, result);
        if (opts.verbose) logResult(result);
        return result;
      }),
    );
    return results;
  });
}

function logResult(r: RenderResult): void {
  const tag = r.ok ? 'ok     ' : r.skipped ? 'skipped' : 'FAILED ';
  console.log(`  ${tag} ${r.route.path}${r.reason ? `  (${r.reason})` : ''}`);
}

export interface CrawlOutcome {
  kept: RenderResult[];
  skipped: RenderResult[];
  failed: RenderResult[];
  /** Sorted, unique same-origin paths that answered 404 on the Export_Server (missing on the live site too). */
  knownMissing: string[];
}

/**
 * Render the initial routes plus every internal link found, applying the skip rules.
 * Languages are processed in the order given (callers pass `en` first), so the
 * identical-to-<lang> baseline is deterministic.
 */
export async function renderCrawl(
  initial: RouteEntry[],
  baseUrl: string,
  opts: PrerenderOptions & { langs: Lang[]; emptyPageIds?: ReadonlySet<string>; softEmptyPageIds?: ReadonlySet<string> },
): Promise<CrawlOutcome> {
  const outcome: CrawlOutcome = { kept: [], skipped: [], failed: [], knownMissing: [] };
  const missing = new Set<string>();
  const seen = new Set<string>(initial.map((r) => r.path.toLowerCase()));
  const hashesByRest = new Map<string, Map<Lang, string>>();
  const restOf = (r: RouteEntry): string => r.path.slice(r.lang.length + 1);

  await withPool(opts.concurrency, async (render) => {
    for (const lang of opts.langs) {
      let queue = initial.filter((r) => r.lang === lang);
      while (queue.length > 0) {
        if (seen.size > MAX_ROUTES) {
          console.warn(`Route cap of ${MAX_ROUTES} reached; link crawl stopped.`);
          break;
        }
        const batch = queue;
        queue = [];
        const results = await Promise.all(
          batch.map((r) =>
            r.pageId && opts.emptyPageIds?.has(r.pageId)
              ? Promise.resolve<RenderResult>({ route: r, ok: false, skipped: true, reason: 'empty-page', apiCalls: [], links: [] })
              : render(r, baseUrl).then((res) =>
                  // Filesystem routes whose DB row has no sections may legitimately render nothing.
                  !res.ok && !res.skipped && r.pageId && opts.softEmptyPageIds?.has(r.pageId)
                    ? { ...res, skipped: true, reason: 'empty-page' }
                    : res,
                ),
          ),
        );

        for (const result of results) {
          const { route } = result;
          for (const m of result.missing ?? []) missing.add(m);
          if (result.ok) {
            const rest = restOf(route);
            const hashes = hashesByRest.get(rest) ?? new Map<Lang, string>();
            const verdict =
              rest === ''
                ? { skip: false as boolean, reason: undefined as string | undefined }
                : shouldSkipIdentical({
                    routePath: route.path,
                    lang: route.lang,
                    hasPageRow: route.source === 'db',
                    mainHash: result.mainTextHash!,
                    keptHashesByLang: hashes,
                  });
            if (verdict.skip) {
              result.ok = false;
              result.skipped = true;
              result.reason = verdict.reason;
              delete result.html;
              outcome.skipped.push(result);
            } else {
              hashes.set(route.lang, result.mainTextHash!);
              hashesByRest.set(rest, hashes);
              writeHtml(opts.outDir, result);
              outcome.kept.push(result);
            }
          } else if (result.skipped) {
            outcome.skipped.push(result);
          } else {
            outcome.failed.push(result);
          }
          if (opts.verbose) logResult(result);

          for (const link of result.links) {
            const key = link.toLowerCase();
            if (seen.has(key) || link.split('/')[1] !== lang) continue;
            seen.add(key);
            queue.push({ lang, path: link, source: 'link' });
          }
        }
      }
    }
  });

  outcome.knownMissing = [...missing].sort();
  return outcome;
}

/**
 * Merges API calls captured across routes. First capture wins; a later capture of the same
 * key with a different status/body is recorded as a warning.
 */
export class ApiSnapshot {
  private readonly entries = new Map<string, CapturedCall>();
  readonly warnings: string[] = [];

  get size(): number {
    return this.entries.size;
  }

  keys(): string[] {
    return [...this.entries.keys()];
  }

  get(key: string): CapturedCall | undefined {
    return this.entries.get(key);
  }

  add(calls: CapturedCall[], from = ''): void {
    for (const call of calls) {
      const existing = this.entries.get(call.key);
      if (!existing) {
        this.entries.set(call.key, call);
      } else if (existing.status !== call.status || existing.body !== call.body) {
        this.warnings.push(`Conflicting API response for ${call.key}${from ? ` (from ${from})` : ''}; kept the first.`);
      }
    }
  }

  addResults(results: RenderResult[]): void {
    for (const r of results) if (r.ok) this.add(r.apiCalls, r.route.path);
  }

  /** Writes `<dir>/_data/api-index.json` and `<dir>/_data/api/<nnnn>.json`. */
  writeSnapshot(dir: string): void {
    const apiDir = path.join(dir, '_data', 'api');
    fs.mkdirSync(apiDir, { recursive: true });
    const index: Record<string, { file: string; status: number }> = {};
    let n = 0;
    // sorted by key: capture order inside a page depends on network timing
    for (const [key, call] of [...this.entries].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))) {
      const file = `${String(++n).padStart(4, '0')}.json`;
      fs.writeFileSync(path.join(apiDir, file), call.body, 'utf8');
      index[key] = { file, status: call.status };
    }
    fs.writeFileSync(path.join(dir, '_data', 'api-index.json'), JSON.stringify(index, null, 2), 'utf8');
  }
}

/** Fetches each blog RSS feed as text from the export server and writes it into the bundle. */
export async function exportBlogFeeds(
  baseUrl: string,
  outDir: string,
  feedPaths: string[],
): Promise<{ written: string[]; warnings: string[] }> {
  const written: string[] = [];
  const warnings: string[] = [];
  for (const feedPath of feedPaths) {
    try {
      const res = await fetch(`${baseUrl}${feedPath}`);
      const body = await res.text();
      if (!res.ok || !body.trimStart().startsWith('<?xml')) {
        warnings.push(`RSS ${feedPath} skipped: HTTP ${res.status}`);
        continue;
      }
      const target = path.join(outDir, ...feedPath.split('/').filter(Boolean));
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, body, 'utf8');
      written.push(feedPath);
    } catch (err) {
      warnings.push(`RSS ${feedPath} failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  return { written, warnings };
}
