/**
 * Asset pipeline: finds every media/static reference in the exported bundle,
 * copies local files from public/, downloads Vercel Blob files and rewrites
 * references so the bundle is self-contained (Requirement 6).
 */
import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';

const MB = 1024 * 1024;
const BLOB_DIR = 'media/blob';
const ALLOWED_DIRS = ['fonts', 'fontawesome', 'webfonts', 'data'];
const ROOT_FILE_RE = /^(robots\.txt|favicon\.ico|apple-touch-icon.*|site\.webmanifest)$/i;
const EXTENSIONS = [
  'png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'svg', 'ico', 'mp4', 'webm',
  'woff', 'woff2', 'ttf', 'otf', 'json', 'css', 'js', 'pdf',
];

export interface AssetOptions {
  bundleDir: string;
  publicDir?: string;
  download?: boolean;
  allowMissing?: boolean;
  fetchImpl?: typeof fetch;
  retryDelayMs?: number;
  timeoutMs?: number;
  thresholds?: { singleFileBytes?: number; totalBytes?: number };
}

export interface BrokenRef {
  ref: string;
  from: string;
  reason?: string;
}

export interface AssetReport {
  ok: boolean;
  copied: string[];
  downloaded: { url: string; file: string; bytes: number }[];
  skippedRemote: string[];
  broken: BrokenRef[];
  rewrittenFiles: number;
  bytes: { copied: number; downloaded: number; total: number };
  warnings: string[];
}

export interface AssetRef {
  /** Exact text found in the source (may contain `\/`, `&amp;`, `%20`). */
  raw: string;
  kind: 'blob' | 'local';
  /** Canonical form: unescaped slashes/entities, query and hash removed. */
  url: string;
}

const caseless = (ext: string) =>
  [...ext].map((c) => (/[a-z]/.test(c) ? `[${c}${c.toUpperCase()}]` : c)).join('');

const SLASH = String.raw`(?:\\?\/)`;
const BLOB_SRC =
  String.raw`https?:${SLASH}{2}[a-z0-9-]+\.(?:public\.)?blob\.vercel-storage\.com${SLASH}` +
  String.raw`(?:(?!&quot;|&#39;|&#x27;)[^\s"'<>)\\]|\\\/)+`;
const LOCAL_SRC =
  String.raw`(?<![A-Za-z0-9_.:/\\-])${SLASH}(?:api${SLASH}uploads|uploads|media|fonts|fontawesome|webfonts|data)${SLASH}` +
  String.raw`(?:[^\s"'<>)(\\?#,]|\\\/)+?\.(?:${EXTENSIONS.map(caseless).join('|')})` +
  String.raw`(?![A-Za-z0-9_%-]|\.[A-Za-z0-9])`;
const REF_SRC = `${BLOB_SRC}|${LOCAL_SRC}`;

const unescapeRef = (raw: string) =>
  raw.replace(/\\\//g, '/').replace(/&amp;/g, '&');

const canonical = (raw: string) => unescapeRef(raw).replace(/[?#].*$/s, '');

const safeDecode = (s: string) => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
};

export function extractAssetRefs(text: string): AssetRef[] {
  const out: AssetRef[] = [];
  for (const m of text.matchAll(new RegExp(REF_SRC, 'g'))) {
    out.push({
      raw: m[0],
      kind: /^https?:/i.test(m[0]) ? 'blob' : 'local',
      url: canonical(m[0]),
    });
  }
  return out;
}

/**
 * Replaces remote URLs found in `map` (canonical url -> local path) and turns
 * `/api/uploads/` into `/uploads/`. Escaping style of each occurrence is kept.
 */
export function rewriteRefs(text: string, map: Record<string, string>): string {
  return text.replace(new RegExp(REF_SRC, 'g'), (raw) => {
    if (/^https?:/i.test(raw)) {
      const local = map[canonical(raw)];
      if (!local) return raw;
      return raw.includes('\\/') ? local.replace(/\//g, '\\/') : local;
    }
    return raw.replace(/^(\\?\/)api(\\?\/)uploads/, '$1uploads');
  });
}

const rewriteJsLiterals = (text: string) =>
  text.replace(/(["'`])\/api\/uploads\//g, '$1/uploads/');

function walk(dir: string, base = dir): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isSymbolicLink() || /^\.env/i.test(entry.name)) continue;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(abs, base));
    else if (entry.isFile()) out.push(path.relative(base, abs).split(path.sep).join('/'));
  }
  return out;
}

/** Maps a decoded URL path to a safe relative path under public/, or null. */
function toPublicRel(urlPath: string): string | null {
  const decoded = safeDecode(urlPath);
  if (decoded.includes('\\') || decoded.includes('\0')) return null;
  const segments = decoded.split('/').slice(1);
  if (segments.some((s) => s === '' || s === '.' || s === '..' || s.includes(':'))) return null;
  if (segments.some((s) => /^\.env/i.test(s))) return null;
  const rel = segments.join('/');
  return rel.replace(/^api\/uploads\//, 'uploads/');
}

function blobFileName(url: string): string {
  const last = safeDecode(url.split('/').pop() ?? '');
  let name = last.replace(/[^A-Za-z0-9._-]+/g, '_').replace(/^\.+/, '') || 'file';
  if (name.length > 80) {
    const ext = path.extname(name).slice(0, 10);
    name = name.slice(0, 80 - ext.length) + ext;
  }
  return `${createHash('sha1').update(url).digest('hex').slice(0, 8)}-${name}`;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchWithRetry(
  fetchImpl: typeof fetch,
  url: string,
  retryDelayMs: number,
  timeoutMs: number
): Promise<Buffer> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 3; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetchImpl(url, { signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return Buffer.from(await res.arrayBuffer());
    } catch (err) {
      lastError = err;
      if (attempt < 3) await sleep(retryDelayMs * attempt);
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

async function runPool<T>(items: T[], size: number, fn: (item: T) => Promise<void>) {
  let next = 0;
  const worker = async () => {
    while (next < items.length) await fn(items[next++]);
  };
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, worker));
}

export async function processAssets(opts: AssetOptions): Promise<AssetReport> {
  const bundleDir = path.resolve(opts.bundleDir);
  const publicDir = path.resolve(opts.publicDir ?? 'public');
  const download = opts.download ?? true;
  const fetchImpl = opts.fetchImpl ?? fetch;
  const retryDelayMs = opts.retryDelayMs ?? 500;
  const timeoutMs = opts.timeoutMs ?? 180000;
  const singleLimit = opts.thresholds?.singleFileBytes ?? 20 * MB;
  const totalLimit = opts.thresholds?.totalBytes ?? 200 * MB;

  const report: AssetReport = {
    ok: true,
    copied: [],
    downloaded: [],
    skippedRemote: [],
    broken: [],
    rewrittenFiles: 0,
    bytes: { copied: 0, downloaded: 0, total: 0 },
    warnings: [],
  };

  const files = walk(bundleDir);
  const textFiles = files.filter(
    (f) => /\.(html|css)$/i.test(f) || (/^_data\//.test(f) && /\.json$/i.test(f))
  );
  const jsFiles = files.filter((f) => /^_next\/static\/.*\.js$/i.test(f));

  const localRefs = new Map<string, Set<string>>(); // canonical path -> referencing files
  const blobRefs = new Map<string, Set<string>>(); // canonical url -> referencing files
  const note = (map: Map<string, Set<string>>, key: string, from: string) => {
    if (!map.has(key)) map.set(key, new Set());
    map.get(key)!.add(from);
  };

  let blobsInJs = 0;
  for (const rel of [...textFiles, ...jsFiles]) {
    const isJs = rel.endsWith('.js');
    for (const ref of extractAssetRefs(fs.readFileSync(path.join(bundleDir, rel), 'utf8'))) {
      if (ref.kind === 'local') note(localRefs, ref.url, rel);
      else if (isJs) blobsInJs++;
      else note(blobRefs, ref.url, rel);
    }
  }
  if (blobsInJs > 0) {
    report.warnings.push(`${blobsInJs} remote Blob URL(s) in JS chunks were left untouched`);
  }

  const sizes = new Map<string, number>(); // bundle-relative path -> bytes
  const addBroken = (ref: string, from: Set<string>, reason?: string) => {
    for (const f of from) report.broken.push({ ref, from: f, ...(reason ? { reason } : {}) });
  };
  const copyIntoBundle = (srcAbs: string, rel: string) => {
    const dest = path.join(bundleDir, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(srcAbs, dest);
    sizes.set(rel, fs.statSync(dest).size);
  };
  const isFile = (p: string) => fs.existsSync(p) && fs.statSync(p).isFile();

  // Local references
  for (const [urlPath, from] of localRefs) {
    const rel = toPublicRel(urlPath);
    if (!rel) {
      addBroken(urlPath, from, 'unsafe path');
      continue;
    }
    if (sizes.has(rel)) continue;
    const src = path.join(publicDir, rel);
    if (path.relative(publicDir, src).startsWith('..')) {
      addBroken(urlPath, from, 'unsafe path');
    } else if (isFile(src)) {
      copyIntoBundle(src, rel);
    } else if (isFile(path.join(bundleDir, rel))) {
      // already present (e.g. produced by an earlier run)
    } else {
      // JS chunks are scanned for discovery only; a missing file referenced solely from code
      // (e.g. admin editor placeholders) is not a broken page reference.
      const pageRefs = new Set([...from].filter((f) => !f.endsWith('.js')));
      if (pageRefs.size > 0) addBroken(urlPath, pageRefs);
      else report.warnings.push(`${urlPath} is referenced only from JS chunks and not found in public/ (ignored)`);
    }
  }

  // Remote Blob files
  const blobMap: Record<string, string> = {};
  const blobUrls = [...blobRefs.keys()];
  if (!download) {
    report.skippedRemote.push(...blobUrls);
  } else {
    await runPool(blobUrls, 4, async (url) => {
      const rel = `${BLOB_DIR}/${blobFileName(url)}`;
      const dest = path.join(bundleDir, rel);
      try {
        let bytes: number;
        if (isFile(dest) && fs.statSync(dest).size > 0) {
          bytes = fs.statSync(dest).size;
        } else {
          const data = await fetchWithRetry(fetchImpl, url, retryDelayMs, timeoutMs);
          fs.mkdirSync(path.dirname(dest), { recursive: true });
          fs.writeFileSync(dest, data);
          bytes = data.length;
        }
        sizes.set(rel, bytes);
        blobMap[url] = `/${rel}`;
        report.downloaded.push({ url, file: rel, bytes });
      } catch (err) {
        addBroken(url, blobRefs.get(url)!, `download failed: ${(err as Error).message}`);
      }
    });
    report.downloaded.sort((a, b) => a.url.localeCompare(b.url));
  }

  // Allow-listed folders and root files
  for (const dir of ALLOWED_DIRS) {
    for (const rel of walk(path.join(publicDir, dir))) {
      copyIntoBundle(path.join(publicDir, dir, rel), `${dir}/${rel}`);
    }
  }
  if (fs.existsSync(publicDir)) {
    for (const entry of fs.readdirSync(publicDir, { withFileTypes: true })) {
      if (entry.isFile() && ROOT_FILE_RE.test(entry.name)) {
        copyIntoBundle(path.join(publicDir, entry.name), entry.name);
      }
    }
  }

  // Rewrite
  const rewrite = (rel: string, fn: (s: string) => string) => {
    const abs = path.join(bundleDir, rel);
    const before = fs.readFileSync(abs, 'utf8');
    const after = fn(before);
    if (after !== before) {
      fs.writeFileSync(abs, after);
      report.rewrittenFiles++;
    }
  };
  for (const rel of textFiles) rewrite(rel, (s) => rewriteRefs(s, blobMap));
  for (const rel of jsFiles) rewrite(rel, rewriteJsLiterals);

  // Totals and warnings
  const downloadedPaths = new Set(report.downloaded.map((d) => d.file));
  for (const [rel, bytes] of [...sizes].sort(([a], [b]) => a.localeCompare(b))) {
    if (downloadedPaths.has(rel)) report.bytes.downloaded += bytes;
    else {
      report.copied.push(rel);
      report.bytes.copied += bytes;
    }
    if (bytes > singleLimit) {
      report.warnings.push(`${rel} is ${(bytes / MB).toFixed(1)} MB (over ${(singleLimit / MB).toFixed(0)} MB)`);
    }
  }
  report.bytes.total = report.bytes.copied + report.bytes.downloaded;
  if (report.bytes.total > totalLimit) {
    report.warnings.push(
      `Total media size is ${(report.bytes.total / MB).toFixed(1)} MB (over ${(totalLimit / MB).toFixed(0)} MB)`
    );
  }

  report.ok = opts.allowMissing ? true : report.broken.length === 0;
  return report;
}
