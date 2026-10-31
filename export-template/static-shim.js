/**
 * Static_Shim: answers the site's /api/* calls from files saved at export time.
 * Loaded before the Next.js bundle. Hand-written, no build step.
 * Keep normalizeApiKey in sync with scripts/export-static/api-key.ts
 * (both are checked against __tests__/fixtures/api-key-vectors.json).
 */
(function (root) {
  'use strict';

  var LANGS = ['fa', 'en', 'ar', 'tr', 'fr', 'de', 'es'];
  var JSON_HEADERS = { 'Content-Type': 'application/json' };
  var BASE = 'http://static.invalid';

  function compare(a, b) {
    return a < b ? -1 : a > b ? 1 : 0;
  }

  function normalizeApiKey(urlOrPath) {
    var u = new URL(String(urlOrPath), BASE);
    var pairs = [];
    u.searchParams.forEach(function (value, name) {
      pairs.push([name, value]);
    });
    pairs.sort(function (a, b) {
      return compare(a[0], b[0]) || compare(a[1], b[1]);
    });
    var query = new URLSearchParams(pairs).toString();
    return u.pathname + (query ? '?' + query : '');
  }

  function normalizePath(input) {
    var decoded;
    try {
      decoded = decodeURIComponent(String(input)).trim();
    } catch (e) {
      decoded = String(input).trim();
    }
    if (!decoded) return '';
    var path = (decoded.charAt(0) === '/' ? decoded : '/' + decoded).replace(/\/{2,}/g, '/');
    if (path.length > 1 && path.charAt(path.length - 1) === '/') path = path.slice(0, -1);
    var parts = path.split('/');
    if (LANGS.indexOf(parts[1].toLowerCase()) !== -1) parts[1] = parts[1].toLowerCase();
    return parts.join('/');
  }

  var api = { normalizeApiKey: normalizeApiKey, normalizePath: normalizePath };
  root.__staticShim = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;

  if (typeof root.fetch !== 'function') return;

  var realFetch = root.fetch.bind(root);
  var indexPromise = null;
  var equivalentsPromise = null;
  var warned = {};

  function loadJson(url) {
    return realFetch(url).then(function (res) {
      if (!res.ok) throw new Error('static shim: cannot load ' + url);
      return res.json();
    });
  }

  function loadIndex() {
    return indexPromise || (indexPromise = loadJson('/_data/api-index.json'));
  }

  function loadEquivalents() {
    return equivalentsPromise || (equivalentsPromise = loadJson('/_data/equivalents.json'));
  }

  function jsonResponse(body, status) {
    return new Response(JSON.stringify(body), { status: status, headers: JSON_HEADERS });
  }

  function notAvailable() {
    return jsonResponse({ error: 'not_available_static' }, 404);
  }

  function checkPage(url) {
    var path = url.searchParams.get('path');
    var normalized = path ? normalizePath(path) : '';
    if (!normalized) return Promise.resolve(jsonResponse({ exists: false, error: 'Path parameter is required' }, 400));
    return loadEquivalents().then(function (eq) {
      var exists = (eq.routes || []).some(function (route) {
        return normalizePath(route) === normalized;
      });
      return jsonResponse({ exists: exists }, 200);
    });
  }

  function findEntry(eq, slug) {
    var bySlug = eq.bySlug || {};
    var normalized = normalizePath(slug);
    var bare = normalized.replace(/^\//, '');
    var candidates = [slug, '/' + slug, slug.replace(/^\/+/, ''), normalized, bare];
    for (var i = 0; i < candidates.length; i++) {
      if (Object.prototype.hasOwnProperty.call(bySlug, candidates[i])) return bySlug[candidates[i]];
    }
    // The caller may already hold the exported path rather than the stored slug.
    for (var key in bySlug) {
      if (Object.prototype.hasOwnProperty.call(bySlug, key) && normalizePath(bySlug[key].path) === normalized) {
        return bySlug[key];
      }
    }
    return null;
  }

  function findEquivalent(url) {
    var slug = url.searchParams.get('slug');
    var lang = url.searchParams.get('lang');
    if (!slug || !lang) {
      return Promise.resolve(jsonResponse({ found: false, error: 'slug and lang parameters are required' }, 400));
    }
    return loadEquivalents().then(function (eq) {
      var entry = findEntry(eq, slug);
      if (!entry) return jsonResponse({ found: false, reason: 'current_page_not_found' }, 200);
      var group = entry.group && (eq.byGroup || {})[entry.group];
      var target = group && group[lang];
      if (!target) return jsonResponse({ found: false, reason: 'no_equivalent_in_group' }, 200);
      return jsonResponse({ found: true, slug: target, method: 'pageGroup' }, 200);
    });
  }

  function fromSnapshot(url) {
    var key = normalizeApiKey(url.pathname + url.search);
    return loadIndex().then(function (index) {
      var hit = Object.prototype.hasOwnProperty.call(index, key) ? index[key] : null;
      if (!hit) {
        if (!warned[key]) {
          warned[key] = true;
          console.warn('[static-shim] no snapshot for ' + key);
        }
        return notAvailable();
      }
      return realFetch('/_data/api/' + hit.file).then(function (res) {
        return res.text().then(function (text) {
          return new Response(text, { status: hit.status, headers: JSON_HEADERS });
        });
      });
    });
  }

  root.fetch = function (input, init) {
    var isRequest = typeof input === 'object' && input !== null && typeof input.url === 'string';
    var rawUrl = isRequest ? input.url : String(input);
    var method = String((init && init.method) || (isRequest && input.method) || 'GET').toUpperCase();
    var headers = new Headers((init && init.headers) || (isRequest && input.headers) || undefined);

    if (headers.has('RSC') || /[?&]_rsc=/.test(rawUrl)) {
      return Promise.reject(new TypeError('static: rsc disabled'));
    }

    var url = new URL(rawUrl, root.location.href);
    if (url.origin !== root.location.origin || url.pathname.indexOf('/api/') !== 0) {
      return realFetch(input, init);
    }

    if (url.pathname === '/api/contact-form' && method === 'POST') return realFetch('/send.php', init);
    if (method !== 'GET') return Promise.resolve(notAvailable());
    if (url.pathname === '/api/pages/check') return checkPage(url);
    if (url.pathname === '/api/pages/find-equivalent') return findEquivalent(url);
    return fromSnapshot(url);
  };
})(typeof window !== 'undefined' ? window : globalThis);
