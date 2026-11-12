/**
 * Helpers for serving files from public/uploads through API routes.
 */

import path from 'path';

export const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

/**
 * Resolve user-supplied path segments (already URL-decoded by Next.js) to a
 * file strictly inside `baseDir`. Returns null for anything that could escape
 * it or is ambiguous: `.`/`..`/empty segments, separators inside a segment
 * (decoded `%2F`/`%5C`, backslashes), absolute or drive paths, null bytes.
 */
export function resolveUploadPath(segments: string | string[], baseDir: string = UPLOADS_DIR): string | null {
  const parts = Array.isArray(segments) ? segments : [segments];
  if (parts.length === 0) return null;

  for (const part of parts) {
    if (typeof part !== 'string' || part === '' || part === '.' || part === '..') return null;
    if (/[\\/\0:]/.test(part)) return null;
  }

  const root = path.resolve(baseDir);
  const resolved = path.resolve(root, ...parts);
  const relative = path.relative(root, resolved);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) return null;
  return resolved;
}

const CONTENT_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

export function getUploadContentType(filename: string): string {
  return CONTENT_TYPES[path.extname(filename).toLowerCase()] || 'application/octet-stream';
}

/**
 * Security headers for a served upload. SVGs get a locked-down CSP so an
 * uploaded SVG opened directly cannot run script on the site's origin.
 */
export function uploadSecurityHeaders(contentType: string): Record<string, string> {
  const headers: Record<string, string> = { 'X-Content-Type-Options': 'nosniff' };
  if (contentType === 'image/svg+xml') {
    headers['Content-Security-Policy'] = "default-src 'none'; style-src 'unsafe-inline'; sandbox";
  }
  return headers;
}
