/**
 * Tiny static file server used to verify a Bundle the way a plain host would serve it:
 * no API, no image optimizer, no PHP. Every request is logged.
 */

import fs from 'fs';
import http from 'http';
import path from 'path';

export interface RequestLogEntry {
  method: string;
  url: string;
  status: number;
}

export interface BundleServer {
  url: string;
  stop(): Promise<void>;
  /** Live list of every request served so far. */
  requests: RequestLogEntry[];
  getRequestLog(): RequestLogEntry[];
}

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.pdf': 'application/pdf',
};

export function mimeFor(file: string): string {
  return MIME[path.extname(file).toLowerCase()] ?? 'application/octet-stream';
}

/** Maps a request pathname to a file inside root, or null when it escapes root or does not exist. */
function resolveFile(root: string, pathname: string): string | null {
  let decoded: string;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  const target = path.join(root, decoded);
  if (target !== root && !target.startsWith(root + path.sep)) return null;
  let stat: fs.Stats;
  try {
    stat = fs.statSync(target);
  } catch {
    return null;
  }
  if (stat.isDirectory()) {
    const index = path.join(target, 'index.html');
    return fs.existsSync(index) ? index : null;
  }
  return target;
}

export async function serveBundle(dir: string, port: number): Promise<BundleServer> {
  const root = path.resolve(dir);
  const requests: RequestLogEntry[] = [];

  const server = http.createServer((req, res) => {
    const method = req.method ?? 'GET';
    const rawUrl = req.url ?? '/';
    const pathname = rawUrl.split('?')[0].split('#')[0];
    const log = (status: number): void => {
      requests.push({ method, url: rawUrl, status });
    };
    const notFound = (): void => {
      const page = path.join(root, '404.html');
      if (fs.existsSync(page)) {
        const body = fs.readFileSync(page);
        res.writeHead(404, { 'Content-Type': MIME['.html'], 'Content-Length': body.length });
        res.end(method === 'HEAD' ? undefined : body);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Not found');
      }
      log(404);
    };

    // These do not exist on a plain static host.
    if (pathname.startsWith('/api/') || pathname.startsWith('/_next/image') || /\.php$/i.test(pathname)) {
      return notFound();
    }
    const file = resolveFile(root, pathname);
    if (!file) return notFound();

    const size = fs.statSync(file).size;
    const headers: http.OutgoingHttpHeaders = { 'Content-Type': mimeFor(file), 'Accept-Ranges': 'bytes' };
    const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range ?? '');
    if (range && (range[1] || range[2])) {
      const start = range[1] ? Number(range[1]) : Math.max(0, size - Number(range[2]));
      const end = range[1] && range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
      if (start > end || start >= size) {
        res.writeHead(416, { 'Content-Range': `bytes */${size}` });
        res.end();
        log(416);
        return;
      }
      res.writeHead(206, { ...headers, 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': end - start + 1 });
      if (method === 'HEAD') res.end();
      else fs.createReadStream(file, { start, end }).pipe(res);
      log(206);
      return;
    }
    res.writeHead(200, { ...headers, 'Content-Length': size });
    if (method === 'HEAD') res.end();
    else fs.createReadStream(file).pipe(res);
    log(200);
  });

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', () => resolve());
  });
  const address = server.address();
  const actualPort = typeof address === 'object' && address ? address.port : port;

  return {
    url: `http://localhost:${actualPort}`,
    requests,
    getRequestLog: () => requests,
    stop: () =>
      new Promise<void>((resolve) => {
        server.closeAllConnections?.();
        server.close(() => resolve());
      }),
  };
}
