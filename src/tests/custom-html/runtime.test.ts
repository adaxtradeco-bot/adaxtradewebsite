import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { runCustomHtmlScript } from '@/lib/custom-html/runtime';

const mkRoot = (html = '') => {
  const el = document.createElement('div');
  el.innerHTML = html;
  document.body.appendChild(el);
  return el;
};

const wrap = (body: string) =>
  `(function (root, document, window, setTimeout, setInterval, requestAnimationFrame) {${body}\n})`;

const run = (root: HTMLElement, body: string, id = 'i1') =>
  runCustomHtmlScript({ instanceId: id, root, js: wrap(body), externalScripts: [] });

beforeEach(() => {
  document.body.innerHTML = '';
  delete (window as any).__CHS_PRERENDER__;
  delete (window as any).__probe;
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('runCustomHtmlScript', () => {
  it('fires DOMContentLoaded listeners via the shim when the page is already loaded', async () => {
    const root = mkRoot('<p id="t"></p>');
    await run(
      root,
      `document.addEventListener('DOMContentLoaded', function () { document.getElementById('t').textContent = 'ready'; });
       window.__probe = document.getElementById('t').textContent;`,
    );
    // delivered asynchronously (microtask), not during script evaluation
    expect((window as any).__probe).toBe('');
    expect(root.querySelector('#t')!.textContent).toBe('ready');
  });

  it('scopes queries to the root', async () => {
    const outside = document.createElement('span');
    outside.id = 'out';
    outside.className = 'x';
    document.body.appendChild(outside);
    const root = mkRoot('<span id="in" class="x"></span>');
    await run(
      root,
      `window.__probe = {
        q: document.querySelector('#out'),
        all: document.querySelectorAll('.x').length,
        byId: document.getElementById('out'),
        byIdIn: document.getElementById('in') && document.getElementById('in').id,
        byClass: document.getElementsByClassName('x').length,
        byTag: document.getElementsByTagName('span').length
      };`,
    );
    const p = (window as any).__probe;
    expect(p.q).toBeNull();
    expect(p.all).toBe(1);
    expect(p.byId).toBeNull();
    expect(p.byIdIn).toBe('in');
    expect(p.byClass).toBe(1);
    expect(p.byTag).toBe(1);
  });

  it('runs two instances of the same tab-toggle script independently', async () => {
    const tabs = `<button class="tab" data-i="0"></button><button class="tab" data-i="1"></button><div class="panel"></div><div class="panel"></div>`;
    const a = mkRoot(tabs);
    const b = mkRoot(tabs);
    const js = `
      var tabs = document.querySelectorAll('.tab'); var panels = document.querySelectorAll('.panel');
      tabs.forEach(function (t) { t.addEventListener('click', function () {
        var i = +t.getAttribute('data-i');
        panels.forEach(function (p, k) { p.classList.toggle('on', k === i); });
      }); });`;
    await runCustomHtmlScript({ instanceId: 'a', root: a, js: wrap(js), externalScripts: [] });
    await runCustomHtmlScript({ instanceId: 'b', root: b, js: wrap(js), externalScripts: [] });
    (a.querySelectorAll('.tab')[1] as HTMLElement).click();
    expect(a.querySelectorAll('.panel')[1].classList.contains('on')).toBe(true);
    expect(b.querySelectorAll('.panel')[1].classList.contains('on')).toBe(false);
    (b.querySelectorAll('.tab')[0] as HTMLElement).click();
    expect(b.querySelectorAll('.panel')[0].classList.contains('on')).toBe(true);
    expect(a.querySelectorAll('.panel')[0].classList.contains('on')).toBe(false);
  });

  it('dispose removes listeners and clears timers and intervals (idempotent)', async () => {
    vi.useFakeTimers();
    const root = mkRoot('<button id="b"></button>');
    const fired = { click: 0, interval: 0, timeout: 0, doc: 0, win: 0 };
    (window as any).__probe = fired;
    const handle = await run(
      root,
      `
      var b = root.querySelector('#b');
      b.addEventListener('click', function () { window.__probe.click++; });
      document.addEventListener('keydown', function () { window.__probe.doc++; });
      window.addEventListener('resize', function () { window.__probe.win++; });
      setInterval(function () { window.__probe.interval++; }, 100);
      setTimeout(function () { window.__probe.timeout++; }, 500);
    `,
    );
    vi.advanceTimersByTime(250);
    expect(fired.interval).toBe(2);
    document.dispatchEvent(new Event('keydown'));
    window.dispatchEvent(new Event('resize'));
    expect(fired.doc).toBe(1);
    expect(fired.win).toBe(1);

    handle.dispose();
    handle.dispose();
    vi.advanceTimersByTime(2000);
    expect(fired.interval).toBe(2);
    expect(fired.timeout).toBe(0);
    document.dispatchEvent(new Event('keydown'));
    window.dispatchEvent(new Event('resize'));
    expect(fired.doc).toBe(1);
    expect(fired.win).toBe(1);
  });

  it('passes document.body, readyState, innerWidth and window.onscroll through the shims', async () => {
    const root = mkRoot();
    const handle = await run(
      root,
      `
      var rec = {};
      rec.body = document.body === window.document.body;
      rec.bodyIsReal = document.body.tagName;
      rec.ready = document.readyState;
      rec.w = window.innerWidth;
      rec.hasCreate = typeof document.createElement('div').appendChild;
      window.onscroll = function () { rec.scrolled = true; };
      window.customGlobal = 42;
      window.__probe = rec;
    `,
    );
    const p = (window as any).__probe;
    expect(p.body).toBe(true);
    expect(p.bodyIsReal).toBe('BODY');
    expect(p.ready).toBe(document.readyState);
    expect(p.w).toBe(window.innerWidth);
    expect(p.hasCreate).toBe('function');
    expect(typeof (window as any).onscroll).toBe('function');
    expect((window as any).customGlobal).toBe(42);
    handle.dispose();
    expect((window as any).onscroll).toBeNull();
    delete (window as any).customGlobal;
  });

  it('contains errors thrown by the script', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const root = mkRoot();
    const handle = await run(root, `throw new Error('boom');`, 'bad1');
    expect(warn).toHaveBeenCalled();
    expect(String(warn.mock.calls[0][0])).toContain('[custom-html bad1]');
    expect(() => handle.dispose()).not.toThrow();
  });

  it('does not leak the registry entry or script element', async () => {
    const root = mkRoot();
    await run(root, '', 'leak');
    expect((window as any).__chsRun?.leak).toBeUndefined();
    expect(document.head.querySelectorAll('script').length).toBe(0);
  });

  it('skips entirely when __CHS_PRERENDER__ is set', async () => {
    (window as any).__CHS_PRERENDER__ = true;
    const root = mkRoot();
    const handle = await run(root, `window.__probe = 'ran';`);
    expect((window as any).__probe).toBeUndefined();
    expect(() => handle.dispose()).not.toThrow();
  });

  it('returns a no-op handle for empty js without external scripts', async () => {
    const handle = await runCustomHtmlScript({ instanceId: 'e', root: mkRoot(), js: '', externalScripts: [] });
    expect(() => handle.dispose()).not.toThrow();
  });
});
