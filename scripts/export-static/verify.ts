/**
 * Bundle verification (Req 11): serves the Bundle on a plain static server and visits every route
 * in headless Chromium, asserting the page behaves the way it would on a host with no API.
 */

import fs from 'fs';
import path from 'path';
import { chromium, type Browser, type BrowserContext } from 'playwright';
import { serveBundle, type BundleServer } from './static-server';
import { languages } from '../../src/lib/i18n/config';

export interface VerifyIssue {
  path: string;
  message: string;
}

export interface VerifyReport {
  ok: boolean;
  pages: number;
  errors: VerifyIssue[];
  warnings: VerifyIssue[];
}

export interface VerifyOptions {
  concurrency?: number;
  verbose?: boolean;
  port?: number;
  keepServing?: boolean;
  /** Paths that also answer 404 on the live site; a 404 subrequest for them is a warning, not an error. */
  knownMissing?: string[];
}

export interface MainTimelineEntry {
  t: number;
  state: string;
  children: number;
}

/** Injected before page scripts: records when <main> is empty / showing a spinner / has content. */
export const MAIN_TIMELINE_INIT_SCRIPT = `
(() => {
  const log = (window.__mainLog = []);
  let last = '';
  const sample = () => {
    const main = document.querySelector('main');
    const state = main
      ? (main.children.length === 0 ? 'empty' : main.querySelector('.animate-spin') && main.innerText.trim().length < 200 ? 'spinner' : 'content')
      : 'no-main';
    if (state !== last) { last = state; log.push({ t: Math.round(performance.now()), state, children: main ? main.children.length : 0 }); }
  };
  new MutationObserver(sample).observe(document, { childList: true, subtree: true, attributes: true });
  const tick = () => { sample(); requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
})();
`;

/** Intervals where <main> was not showing content after it had shown content once. */
export function findBadIntervals(
  timeline: MainTimelineEntry[],
  endMs: number,
): Array<{ state: string; fromMs: number; durationMs: number }> {
  const firstContent = timeline.findIndex((e) => e.state === 'content');
  const bad: Array<{ state: string; fromMs: number; durationMs: number }> = [];
  if (firstContent < 0) return bad;
  for (let i = firstContent + 1; i < timeline.length; i++) {
    if (timeline[i].state === 'content') continue;
    const next = timeline.slice(i + 1).find((e) => e.state === 'content');
    bad.push({ state: timeline[i].state, fromMs: timeline[i].t, durationMs: (next?.t ?? endMs) - timeline[i].t });
  }
  return bad;
}

const FLASH_WARN_MS = 500;
const FLASH_ERROR_MS = 1500;
const MIN_RAW_TEXT = 200;
const MIN_RAW_TEXT_FLOOR = 40;
// #329 ("Unknown root exit status") is the flaky tail of a failed hydration retry.
const HYDRATION_RE = /Minified React error #(329|418|423|425)\b|hydrat/i;
const IGNORED_ERROR_RE = /Failed to fetch RSC payload/i;

function normalizePath(p: string): string {
  const clean = p.split('?')[0].split('#')[0];
  return clean.length > 1 ? clean.replace(/\/+$/, '') : clean;
}

function stripToText(html: string): string {
  return html
    .replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function inspectRawHtml(html: string): { title: string; mainText: string } {
  const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1].trim() ?? '';
  const start = html.search(/<main[\s>]/i);
  const end = html.toLowerCase().lastIndexOf('</main>');
  const mainText = start >= 0 && end > start ? stripToText(html.slice(start, end)) : '';
  return { title, mainText };
}

interface Collector {
  errors: VerifyIssue[];
  warnings: VerifyIssue[];
}

async function checkPage(
  context: BrowserContext,
  baseUrl: string,
  routePath: string,
  out: Collector,
  knownMissing: ReadonlySet<string>,
): Promise<void> {
  const error = (message: string): void => void out.errors.push({ path: routePath, message });
  const warn = (message: string): void => void out.warnings.push({ path: routePath, message });
  const page = await context.newPage();

  const forbidden = new Set<string>();
  const failed: Array<{ status: number; url: string }> = [];
  const pageErrors: string[] = [];
  page.on('request', (r) => {
    let u: URL;
    try {
      u = new URL(r.url());
    } catch {
      return;
    }
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return;
    if (u.pathname.startsWith('/api/') || u.pathname.startsWith('/_next/image') || u.hostname.endsWith('.vercel-storage.com')) {
      forbidden.add(r.url());
    }
  });
  page.on('response', (r) => {
    if (r.status() >= 400 && !/favicon/i.test(r.url()) && r.request().resourceType() !== 'document') {
      failed.push({ status: r.status(), url: r.url() });
    }
  });
  page.on('pageerror', (e) => pageErrors.push(e.message));

  try {
    const response = await page.goto(`${baseUrl}${routePath}`, { waitUntil: 'domcontentloaded' });
    if (response?.status() !== 200) error(`HTTP ${response?.status() ?? 'no response'} (expected 200)`);
    // remote media can keep the network busy, so idle is best-effort
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => undefined);
    await page.waitForTimeout(1000);

    for (const url of forbidden) error(`forbidden request: ${url}`);
    for (const f of failed) {
      if (forbidden.has(f.url)) continue;
      if (f.status === 404 && knownMissing.has(new URL(f.url).pathname)) warn(`404 ${f.url}: also missing on the live site`);
      else error(`failed subrequest: ${f.status} ${f.url}`);
    }

    const hydration = pageErrors.filter((m) => HYDRATION_RE.test(m));
    if (hydration.length > 0) warn(`React hydration warning x${hydration.length}: ${hydration[0].slice(0, 160)}`);
    for (const m of pageErrors) {
      if (!HYDRATION_RE.test(m) && !IGNORED_ERROR_RE.test(m)) error(`uncaught page error: ${m.slice(0, 300)}`);
    }

    const info = await page.evaluate(() => {
      const main = document.querySelector('main');
      return {
        hasMain: !!main,
        mainText: main?.textContent?.trim() ?? '',
        mainChildren: main?.children.length ?? 0,
        spinner: !!main?.querySelector('.animate-spin'),
        lang: document.documentElement.getAttribute('lang'),
        dir: document.documentElement.getAttribute('dir'),
        timeline: ((window as unknown as { __mainLog?: unknown }).__mainLog ?? []) as unknown,
        now: Math.round(performance.now()),
      };
    });

    if (!info.hasMain) error('no <main> element');
    else if (info.mainChildren === 0 || info.mainText.length === 0) error('<main> is empty');
    else if (info.spinner && info.mainText.length < MIN_RAW_TEXT) error('spinner still showing in <main> after settle');

    const timeline = info.timeline as MainTimelineEntry[];
    const first = timeline.findIndex((e) => e.state === 'content');
    const initialMs = first > 0 ? timeline[first].t : 0;
    const flashMs = Math.max(initialMs, ...findBadIntervals(timeline, info.now).map((b) => b.durationMs));
    if (flashMs > FLASH_ERROR_MS) error(`<main> empty/spinner for ${flashMs}ms (limit ${FLASH_ERROR_MS}ms)`);
    else if (flashMs > FLASH_WARN_MS) warn(`<main> empty/spinner for ${flashMs}ms`);

    const seg = routePath.split('/')[1];
    if (seg in languages) {
      if (info.lang !== seg) error(`<html lang="${info.lang}"> does not match route language "${seg}"`);
      const expectedDir = languages[seg].dir;
      if (info.dir !== expectedDir) error(`<html dir="${info.dir}"> expected "${expectedDir}"`);
    }

    const raw = await (await fetch(`${baseUrl}${routePath}`)).text();
    const { title, mainText } = inspectRawHtml(raw);
    if (!title) error('raw HTML has no <title>');
    // Genuinely short pages pass when the raw HTML carries (nearly) all the text the live DOM shows.
    const liveLength = info.mainText.replace(/\s+/g, ' ').length;
    const rawTooShort =
      mainText.length < MIN_RAW_TEXT_FLOOR || (mainText.length < MIN_RAW_TEXT && mainText.length < liveLength * 0.8);
    if (rawTooShort) error(`raw HTML <main> has only ${mainText.length} chars of text (need ${MIN_RAW_TEXT})`);
  } catch (e) {
    error(`verification failed: ${e instanceof Error ? e.message : String(e)}`);
  } finally {
    await page.close().catch(() => undefined);
  }
}

interface Equivalents {
  byGroup: Record<string, Record<string, string>>;
}

function readEquivalents(bundleDir: string): Equivalents | null {
  try {
    const parsed = JSON.parse(fs.readFileSync(path.join(bundleDir, '_data', 'equivalents.json'), 'utf8'));
    return parsed && typeof parsed.byGroup === 'object' ? (parsed as Equivalents) : null;
  } catch {
    return null;
  }
}

async function mobileMenuCheck(browser: Browser, baseUrl: string, routePath: string, out: Collector): Promise<void> {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  try {
    const page = await context.newPage();
    await page.goto(`${baseUrl}${routePath}`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => undefined);
    await page.waitForTimeout(1000);
    const toggle = page.locator('button[aria-label*="menu" i]').first();
    if ((await toggle.count()) === 0) {
      out.warnings.push({ path: routePath, message: 'mobile menu toggle not found' });
      return;
    }
    const before = await page.locator('a:visible').count();
    await toggle.click();
    await page.waitForTimeout(500);
    const after = await page.locator('a:visible').count();
    if (after <= before) out.warnings.push({ path: routePath, message: `mobile menu did not reveal links (${before} -> ${after})` });
  } catch (e) {
    out.warnings.push({ path: routePath, message: `mobile menu check failed: ${e instanceof Error ? e.message : e}` });
  } finally {
    await context.close();
  }
}

/** Opens the language dropdown on routePath, picks `toLang` and reports where navigation ended. */
async function switchLanguage(
  browser: Browser,
  baseUrl: string,
  routePath: string,
  toLang: string,
  expectedPath: string,
  out: Collector,
): Promise<void> {
  const label = `language switch ${routePath} -> ${toLang}`;
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  try {
    const page = await context.newPage();
    let saw404 = false;
    page.on('response', (r) => {
      if (r.status() === 404 && r.request().resourceType() === 'document') saw404 = true;
    });
    await page.goto(`${baseUrl}${routePath}`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => undefined);
    await page.waitForTimeout(1000);
    const toggle = page.locator('button[aria-label="Select language"]').first();
    if ((await toggle.count()) === 0) {
      out.warnings.push({ path: routePath, message: `${label}: language switcher not found` });
      return;
    }
    await toggle.click();
    const option = toggle
      .locator('xpath=following-sibling::div//button')
      .filter({ hasText: languages[toLang]?.nativeName ?? toLang })
      .first();
    if ((await option.count()) === 0) {
      out.warnings.push({ path: routePath, message: `${label}: option for "${toLang}" not found in switcher` });
      return;
    }
    await option.click();
    const want = normalizePath(expectedPath);
    const landed = await page
      .waitForURL((u) => normalizePath(u.pathname) === want, { timeout: 7000 })
      .then(() => true)
      .catch(() => false);
    if (landed) {
      await page.waitForTimeout(500);
      if (saw404) out.errors.push({ path: routePath, message: `${label}: landed on a 404 page (${want})` });
      return;
    }
    const at = normalizePath(new URL(page.url()).pathname);
    if (saw404) out.errors.push({ path: routePath, message: `${label}: navigation hit a 404 (at ${at}, expected ${want})` });
    else out.warnings.push({ path: routePath, message: `${label}: ended at ${at}, expected ${want}` });
  } catch (e) {
    out.warnings.push({ path: routePath, message: `${label}: check failed: ${e instanceof Error ? e.message : e}` });
  } finally {
    await context.close();
  }
}

async function languageSwitchChecks(
  browser: Browser,
  baseUrl: string,
  bundleDir: string,
  routePaths: string[],
  out: Collector,
): Promise<void> {
  const routeSet = new Set(routePaths.map(normalizePath));
  const eq = readEquivalents(bundleDir);

  // (1) a page with an equivalent in another language
  let withEquivalent: { from: string; toLang: string; to: string } | null = null;
  for (const group of Object.values(eq?.byGroup ?? {})) {
    const entries = Object.entries(group).filter(([, p]) => routeSet.has(normalizePath(p)));
    if (entries.length >= 2) {
      withEquivalent = { from: entries[0][1], toLang: entries[1][0], to: entries[1][1] };
      break;
    }
  }
  if (withEquivalent) await switchLanguage(browser, baseUrl, withEquivalent.from, withEquivalent.toLang, withEquivalent.to, out);
  else out.warnings.push({ path: '/', message: 'language switch: no page group with two exported languages to test' });

  // (2) a page without an equivalent falls back to the target language home after the notification
  const langsInBundle = [...new Set(routePaths.map((p) => p.split('/')[1]).filter((s) => s in languages))];
  const grouped = new Set<string>();
  for (const group of Object.values(eq?.byGroup ?? {})) for (const p of Object.values(group)) grouped.add(normalizePath(p));
  for (const from of routePaths) {
    const fromLang = from.split('/')[1];
    if (!(fromLang in languages) || normalizePath(from) === `/${fromLang}`) continue;
    const rest = from.slice(fromLang.length + 1);
    const toLang = langsInBundle.find((l) => l !== fromLang && !routeSet.has(normalizePath(`/${l}${rest}`)));
    if (toLang && !grouped.has(normalizePath(from))) {
      await switchLanguage(browser, baseUrl, from, toLang, `/${toLang}`, out);
      return;
    }
  }
  out.warnings.push({ path: '/', message: 'language switch: no page without an equivalent to test the home fallback' });
}

export async function verifyBundle(bundleDir: string, routePaths: string[], opts: VerifyOptions = {}): Promise<VerifyReport> {
  const concurrency = Math.max(1, opts.concurrency ?? 4);
  const out: Collector = { errors: [], warnings: [] };
  const knownMissing = new Set(opts.knownMissing ?? []);

  let server: BundleServer;
  try {
    server = await serveBundle(bundleDir, opts.port ?? 4100);
  } catch (e) {
    if (opts.port !== undefined || (e as NodeJS.ErrnoException).code !== 'EADDRINUSE') throw e;
    server = await serveBundle(bundleDir, 0);
  }
  const baseUrl = server.url.replace('localhost', '127.0.0.1');
  let browser: Browser | undefined;
  try {
    browser = await chromium.launch();
    const b = browser;
    const queue = [...routePaths];
    let done = 0;
    const worker = async (): Promise<void> => {
      const context = await b.newContext({ viewport: { width: 1280, height: 800 } });
      await context.addInitScript(MAIN_TIMELINE_INIT_SCRIPT);
      try {
        for (let route = queue.shift(); route !== undefined; route = queue.shift()) {
          await checkPage(context, baseUrl, route, out, knownMissing);
          done++;
          if (opts.verbose) console.log(`verify ${done}/${routePaths.length} ${route}`);
        }
      } finally {
        await context.close();
      }
    };
    await Promise.all(Array.from({ length: Math.min(concurrency, routePaths.length) }, worker));

    if (routePaths.length > 0) {
      await mobileMenuCheck(b, baseUrl, routePaths[0], out);
      await languageSwitchChecks(b, baseUrl, bundleDir, routePaths, out);
    }
  } finally {
    await browser?.close().catch(() => undefined);
    if (opts.keepServing) console.log(`Serving bundle at ${baseUrl}`);
    else await server.stop();
  }

  return { ok: out.errors.length === 0, pages: routePaths.length, errors: out.errors, warnings: out.warnings };
}
