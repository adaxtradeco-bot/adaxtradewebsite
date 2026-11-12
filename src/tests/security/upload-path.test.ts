// @vitest-environment node
import { describe, it, expect } from 'vitest';
import path from 'path';
import { resolveUploadPath, uploadSecurityHeaders, getUploadContentType } from '@/lib/upload-files';

const base = path.resolve('/srv/site/public/uploads');

describe('resolveUploadPath', () => {
  it('resolves normal files and sub-folders inside the uploads dir', () => {
    expect(resolveUploadPath('photo.jpg', base)).toBe(path.join(base, 'photo.jpg'));
    expect(resolveUploadPath(['2024', '05', 'a b.png'], base)).toBe(path.join(base, '2024', '05', 'a b.png'));
  });

  it.each([
    [['..', 'secret.txt']],
    [['a', '..', '..', 'x']],
    [['..']],
    [['.']],
    [['']],
    [[]],
    [['..%2f..%2fetc']], // stays literal (Next decodes once) but we still never escape
  ])('rejects or contains traversal %j', (segments) => {
    const r = resolveUploadPath(segments as string[], base);
    if (r !== null) expect(r.startsWith(base + path.sep)).toBe(true);
  });

  it.each([
    '../../etc/passwd', // decoded %2F inside one segment
    '..\\..\\windows\\win.ini', // backslashes
    'a\\b.png',
    '/etc/passwd', // absolute
    'C:\\Windows\\win.ini', // drive path
    'C:evil', // drive-relative
    'photo.jpg\0.png', // null byte
    'uploads/../../x',
  ])('rejects %j', (segment) => {
    expect(resolveUploadPath(segment, base)).toBeNull();
    expect(resolveUploadPath(['ok', segment], base)).toBeNull();
  });

  it('rejects the uploads dir itself', () => {
    expect(resolveUploadPath(['.'], base)).toBeNull();
  });
});

describe('upload response headers', () => {
  it('always sets nosniff', () => {
    expect(uploadSecurityHeaders('image/png')).toEqual({ 'X-Content-Type-Options': 'nosniff' });
  });
  it('sandboxes SVGs with a CSP', () => {
    const type = getUploadContentType('x.SVG');
    expect(type).toBe('image/svg+xml');
    expect(uploadSecurityHeaders(type)['Content-Security-Policy']).toBe(
      "default-src 'none'; style-src 'unsafe-inline'; sandbox",
    );
  });
  it('unknown extensions are served as octet-stream', () => {
    expect(getUploadContentType('evil.html')).toBe('application/octet-stream');
  });
});
