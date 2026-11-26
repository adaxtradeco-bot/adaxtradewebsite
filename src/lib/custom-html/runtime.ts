/**
 * Custom HTML section — client runtime for template JS.
 * Spec: docs/custom-html-section-spec.md §7.3
 *
 * Runs the compiled wrapper function with a root-scoped `document` shim, a
 * `window` shim, and tracked timers so the script can be disposed on unmount.
 * The shims are explicit-trap Proxies (never a bare Proxy over the real objects).
 */
import type { RuntimeHandle } from './types';

export interface RunOptions {
  instanceId: string;
  root: HTMLElement;
  js: string;
  externalScripts: string[];
}

const NOOP_HANDLE: RuntimeHandle = { dispose() {} };

interface TrackedListener {
  target: EventTarget;
  type: string;
  listener: EventListenerOrEventListenerObject;
  capture: boolean;
  options?: boolean | AddEventListenerOptions;
  /** true when the event was delivered via microtask instead of a real listener */
  synthetic: boolean;
  cancelled: boolean;
}

// ---------------------------------------------------------------------------
// External scripts (once per page, sequential)
// ---------------------------------------------------------------------------

const pendingExternal = new Map<string, Promise<void>>();

function isHttpUrl(src: string): boolean {
  return /^https?:\/\//i.test(src);
}

function loadExternalScript(src: string): Promise<void> {
  const existing = Array.from(document.querySelectorAll('script[data-chs-ext]')).find(
    (s) => s.getAttribute('data-chs-ext') === src,
  );
  if (existing) {
    return pendingExternal.get(src) ?? Promise.resolve();
  }
  const promise = new Promise<void>((resolve) => {
    const el = document.createElement('script');
    el.src = src;
    el.async = false;
    el.setAttribute('data-chs-ext', src);
    el.addEventListener('load', () => resolve());
    el.addEventListener('error', () => {
      console.warn('[custom-html] failed to load external script', src);
      resolve();
    });
    (document.head || document.documentElement).appendChild(el);
  });
  pendingExternal.set(src, promise);
  return promise;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function cssEscape(id: string): string {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') return CSS.escape(id);
  return String(id)
    .replace(/^[0-9]/, (d) => `\\3${d} `)
    .replace(/[^\w-]/g, (c) => `\\${c}`);
}

function wantsCapture(options?: boolean | EventListenerOptions): boolean {
  return typeof options === 'boolean' ? options : !!options?.capture;
}

function invokeListener(
  listener: EventListenerOrEventListenerObject,
  thisArg: EventTarget,
  event: Event,
  id: string,
): void {
  try {
    if (typeof listener === 'function') listener.call(thisArg, event);
    else listener?.handleEvent?.(event);
  } catch (e) {
    console.warn(`[custom-html ${id}]`, e);
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function runCustomHtmlScript(opts: RunOptions): Promise<RuntimeHandle> {
  const { instanceId, root, js } = opts;
  const externalScripts = (opts.externalScripts || []).filter((s) => typeof s === 'string' && isHttpUrl(s));

  if (typeof window === 'undefined' || typeof document === 'undefined') return NOOP_HANDLE;
  if ((window as any).__CHS_PRERENDER__ === true) return NOOP_HANDLE;
  if (!js && externalScripts.length === 0) return NOOP_HANDLE;

  for (const src of externalScripts) {
    await loadExternalScript(src);
  }
  if (!js) return NOOP_HANDLE;

  // --- tracking state -------------------------------------------------------
  let disposed = false;
  const listeners: TrackedListener[] = [];
  const timeouts = new Set<number>();
  const intervals = new Set<number>();
  const frames = new Set<number>();
  /** on* properties assigned through a shim: restored to null on dispose if unchanged */
  const handlerProps: { target: any; prop: string; value: unknown }[] = [];

  const trackedSetTimeout = (handler: any, timeout?: number, ...args: any[]): number => {
    if (disposed || typeof handler !== 'function') {
      return disposed ? 0 : (window.setTimeout as any)(handler, timeout, ...args);
    }
    const id = window.setTimeout(() => {
      timeouts.delete(id);
      handler(...args);
    }, timeout) as unknown as number;
    timeouts.add(id);
    return id;
  };
  const trackedSetInterval = (handler: any, timeout?: number, ...args: any[]): number => {
    if (disposed || typeof handler !== 'function') {
      return disposed ? 0 : (window.setInterval as any)(handler, timeout, ...args);
    }
    const id = window.setInterval(() => handler(...args), timeout) as unknown as number;
    intervals.add(id);
    return id;
  };
  const trackedRAF = (cb: FrameRequestCallback): number => {
    if (disposed) return 0;
    const id = window.requestAnimationFrame((t) => {
      frames.delete(id);
      cb(t);
    });
    frames.add(id);
    return id;
  };
  const trackedCancelRAF = (id: number) => {
    frames.delete(id);
    window.cancelAnimationFrame(id);
  };

  // --- tracked listeners ----------------------------------------------------
  const addTracked = (
    target: EventTarget,
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options: boolean | AddEventListenerOptions | undefined,
    alreadyFired: boolean,
    eventTargetForCall: EventTarget,
  ) => {
    if (disposed || !listener) return;
    const entry: TrackedListener = {
      target,
      type,
      listener,
      capture: wantsCapture(options),
      options,
      synthetic: alreadyFired,
      cancelled: false,
    };
    listeners.push(entry);
    if (alreadyFired) {
      queueMicrotask(() => {
        if (entry.cancelled || disposed) return;
        invokeListener(listener, eventTargetForCall, new Event(type), instanceId);
      });
    } else {
      target.addEventListener(type, listener, options);
    }
  };

  const removeTracked = (
    target: EventTarget,
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | EventListenerOptions,
  ) => {
    if (!listener) return;
    const capture = wantsCapture(options);
    for (let i = listeners.length - 1; i >= 0; i--) {
      const l = listeners[i];
      if (l.target === target && l.type === type && l.listener === listener && l.capture === capture) {
        l.cancelled = true;
        if (!l.synthetic) target.removeEventListener(type, listener, l.options);
        listeners.splice(i, 1);
        break;
      }
    }
    // not one of ours: pass through so scripts can detach their own earlier real listeners
  };

  const isLoaded = () => document.readyState !== 'loading';

  // --- bound-function cache --------------------------------------------------
  const makeBinder = (target: object) => {
    const cache = new WeakMap<Function, Function>();
    return (fn: Function): Function => {
      // Constructors/classes (have a prototype) are returned as-is so `.prototype`/`instanceof` work.
      if ((fn as { prototype?: unknown }).prototype !== undefined) return fn;
      let b = cache.get(fn);
      if (!b) {
        b = fn.bind(target) as Function;
        cache.set(fn, b);
      }
      return b;
    };
  };
  const bindDoc = makeBinder(document);
  const bindWin = makeBinder(window);

  const recordHandlerProp = (target: any, prop: string, value: unknown) => {
    if (/^on[a-z]+$/.test(prop)) handlerProps.push({ target, prop, value });
  };

  // --- document shim ---------------------------------------------------------
  const docShim: any = new Proxy({} as any, {
    get(_t, p) {
      switch (p) {
        case 'querySelector':
          return (s: string) => root.querySelector(s);
        case 'querySelectorAll':
          return (s: string) => root.querySelectorAll(s);
        case 'getElementById':
          return (id: string) => root.querySelector('#' + cssEscape(String(id)));
        case 'getElementsByClassName':
          return (n: string) => root.getElementsByClassName(n);
        case 'getElementsByTagName':
          return (n: string) => root.getElementsByTagName(n);
        case 'addEventListener':
          return (type: string, listener: any, options?: any) =>
            addTracked(
              document,
              type,
              listener,
              options,
              (type === 'DOMContentLoaded' || type === 'readystatechange') && isLoaded(),
              document,
            );
        case 'removeEventListener':
          return (type: string, listener: any, options?: any) => removeTracked(document, type, listener, options);
        default: {
          const v = Reflect.get(document, p, document);
          return typeof v === 'function' ? bindDoc(v) : v;
        }
      }
    },
    set(_t, p, v) {
      if (typeof p === 'string') recordHandlerProp(document, p, v);
      return Reflect.set(document, p, v, document);
    },
    has(_t, p) {
      return Reflect.has(document, p);
    },
  });

  // --- window shim -----------------------------------------------------------
  const winShim: any = new Proxy({} as any, {
    get(_t, p) {
      switch (p) {
        case 'document':
          return docShim;
        case 'window':
        case 'self':
          return winShim;
        case 'setTimeout':
          return trackedSetTimeout;
        case 'setInterval':
          return trackedSetInterval;
        case 'requestAnimationFrame':
          return trackedRAF;
        case 'cancelAnimationFrame':
          return trackedCancelRAF;
        case 'addEventListener':
          return (type: string, listener: any, options?: any) =>
            addTracked(
              window,
              type,
              listener,
              options,
              type === 'load' ? document.readyState === 'complete' : type === 'DOMContentLoaded' && isLoaded(),
              window,
            );
        case 'removeEventListener':
          return (type: string, listener: any, options?: any) => removeTracked(window, type, listener, options);
        default: {
          const v = Reflect.get(window, p, window);
          return typeof v === 'function' ? bindWin(v) : v;
        }
      }
    },
    set(_t, p, v) {
      if (typeof p === 'string') recordHandlerProp(window, p, v);
      return Reflect.set(window, p, v, window);
    },
    has(_t, p) {
      return Reflect.has(window, p);
    },
  });

  // --- evaluate the wrapper source -------------------------------------------
  // document.defaultView is the real window (identical to `window` in browsers).
  const realWin: any = document.defaultView || window;
  let fn: unknown;
  try {
    const script = document.createElement('script');
    const key = JSON.stringify(instanceId);
    // The function is registered on window.__chsRun[id] (spec) and also handed back through the
    // executing <script> element, which stays reachable even if `window` differs between realms.
    script.text =
      `window.__chsRun = window.__chsRun || {}; window.__chsRun[${key}] = ${js}
;` +
      ` if (document.currentScript) document.currentScript.__chsFn = window.__chsRun[${key}];` +
      ` delete window.__chsRun[${key}];`;
    (document.head || document.documentElement).appendChild(script);
    script.remove();
    fn = (script as any).__chsFn ?? realWin.__chsRun?.[instanceId];
    if (realWin.__chsRun) delete realWin.__chsRun[instanceId];
    if (typeof fn !== 'function') throw new Error('template script did not evaluate to a function');
    (fn as Function)(root, docShim, winShim, trackedSetTimeout, trackedSetInterval, trackedRAF);
  } catch (e) {
    console.warn(`[custom-html ${instanceId}]`, e);
  }

  return {
    dispose() {
      if (disposed) return;
      disposed = true;
      for (const l of listeners) {
        l.cancelled = true;
        if (!l.synthetic) {
          try {
            l.target.removeEventListener(l.type, l.listener, l.options);
          } catch {
            /* ignore */
          }
        }
      }
      listeners.length = 0;
      timeouts.forEach((id) => window.clearTimeout(id));
      intervals.forEach((id) => window.clearInterval(id));
      frames.forEach((id) => window.cancelAnimationFrame(id));
      timeouts.clear();
      intervals.clear();
      frames.clear();
      for (const h of handlerProps) {
        try {
          if (h.target[h.prop] === h.value) h.target[h.prop] = null;
        } catch {
          /* ignore */
        }
      }
      handlerProps.length = 0;
    },
  };
}
