// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { verifyBundle, inspectRawHtml, type VerifyReport } from '../verify';

const FILLER = 'Static export verification fixture paragraph with enough readable words to pass the minimum text check. '.repeat(3);

function page(opts: { lang?: string; dir?: string; main?: string; script?: string; title?: string } = {}): string {
  const lang = opts.lang ?? 'en';
  const main = opts.main ?? `<h1>Hello</h1><p>${FILLER}</p>`;
  return (
    `<!doctype html><html lang="${lang}" dir="${opts.dir ?? 'ltr'}"><head>` +
    `<title>${opts.title ?? 'Fixture'}</title></head><body><main>${main}</main>` +
    `${opts.script ? `<script>${opts.script}</script>` : ''}</body></html>`
  );
}

let dir: string;
let report: VerifyReport;

function write(route: string, html: string): void {
  const target = path.join(dir, route);
  fs.mkdirSync(target, { recursive: true });
  fs.writeFileSync(path.join(target, 'index.html'), html);
}

const issuesFor = (list: VerifyReport['errors'], p: string): string =>
  list.filter((i) => i.path === p).map((i) => i.message).join(' | ');

beforeAll(async () => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'verify-'));
  write('en', page());
  write('en/api-call', page({ script: "fetch('/api/x').catch(function(){});" }));
  write('en/wrong-lang', page({ lang: 'fa', dir: 'rtl' }));
  write('en/empty', page({ main: '' }));
  write('en/boom', page({ script: "setTimeout(function(){ throw new Error('kaboom'); }, 50);" }));
  write('en/hydration', page({ script: "setTimeout(function(){ throw new Error('Minified React error #418'); }, 50);" }));
  write('en/short', page({ main: '<p>too short</p>' }));
  write('en/known-missing', page({ main: `<h1>Hello</h1><p>${FILLER}</p><img src="/grid.svg" alt="">` }));
  write('en/unknown-missing', page({ main: `<h1>Hello</h1><p>${FILLER}</p><img src="/other.png" alt="">` }));
  report = await verifyBundle(
    dir,
    ['/en', '/en/api-call', '/en/wrong-lang', '/en/empty', '/en/boom', '/en/hydration', '/en/short', '/en/known-missing', '/en/unknown-missing'],
    { port: 0, concurrency: 3, knownMissing: ['/grid.svg'] },
  );
}, 90_000);

afterAll(() => {
  fs.rmSync(dir, { recursive: true, force: true });
});

describe('verifyBundle', () => {
  it('reports every page and fails overall', () => {
    expect(report.pages).toBe(9);
    expect(report.ok).toBe(false);
  });

  it('passes a healthy page without errors', () => {
    expect(issuesFor(report.errors, '/en')).toBe('');
  });

  it('flags requests to /api/', () => {
    expect(issuesFor(report.errors, '/en/api-call')).toMatch(/forbidden request: .*\/api\/x/);
  });

  it('flags a lang/dir mismatch', () => {
    const msg = issuesFor(report.errors, '/en/wrong-lang');
    expect(msg).toMatch(/lang="fa"/);
    expect(msg).toMatch(/dir="rtl"/);
  });

  it('flags an empty <main>', () => {
    expect(issuesFor(report.errors, '/en/empty')).toMatch(/<main> is empty/);
  });

  it('treats uncaught errors as errors and React hydration errors as warnings', () => {
    expect(issuesFor(report.errors, '/en/boom')).toMatch(/kaboom/);
    expect(issuesFor(report.errors, '/en/hydration')).toBe('');
    expect(issuesFor(report.warnings, '/en/hydration')).toMatch(/hydration/i);
  });

  it('requires visible text in the raw HTML <main>', () => {
    expect(issuesFor(report.errors, '/en/short')).toMatch(/only \d+ chars/);
  });

  it('downgrades a 404 subrequest to a warning only when it is a known-missing path', () => {
    expect(issuesFor(report.errors, '/en/known-missing')).toBe('');
    expect(issuesFor(report.warnings, '/en/known-missing')).toMatch(/grid\.svg: also missing on the live site/);
    expect(issuesFor(report.errors, '/en/unknown-missing')).toMatch(/failed subrequest: 404 .*other\.png/);
  });

  it('warns (not errors) when interaction controls are missing', () => {
    expect(report.warnings.some((w) => /mobile menu toggle not found/.test(w.message))).toBe(true);
  });
});

describe('inspectRawHtml', () => {
  it('extracts title and strips tags and scripts from main', () => {
    const r = inspectRawHtml('<title> T </title><main><script>x()</script><p>a <b>b</b></p></main>');
    expect(r).toEqual({ title: 'T', mainText: 'a b' });
  });
});
