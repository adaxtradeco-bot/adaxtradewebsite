import { lookup } from 'dns/promises';
import { isIP } from 'net';
import { put } from '@vercel/blob';

const MAX_BYTES = 8 * 1024 * 1024;
const TIMEOUT_MS = 10_000;

function isPrivateIp(ip: string): boolean {
  const v = ip.toLowerCase().replace(/^::ffff:/, '');
  if (isIP(v) === 4) {
    const [a, b] = v.split('.').map(Number);
    return a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || a >= 224;
  }
  return v === '::' || v === '::1' || /^f[cd]/.test(v) || /^fe[89ab]/.test(v);
}

async function assertPublicHost(hostname: string) {
  const host = hostname.replace(/^\[|\]$/g, '');
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local')) throw new Error('private host');
  const addresses = isIP(host) ? [{ address: host }] : await lookup(host, { all: true });
  if (!addresses.length || addresses.some((a) => isPrivateIp(a.address))) throw new Error('private host');
}

/** Downloads an external image into Vercel Blob. Never throws. */
export async function importCover(url: string): Promise<{ url: string } | { error: string }> {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return { error: 'cover image must use https' };
    await assertPublicHost(parsed.hostname);

    const res = await fetch(parsed.toString(), { redirect: 'manual', signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!res.ok) return { error: `cover download failed (${res.status})` };
    const type = (res.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase();
    if (!type.startsWith('image/')) return { error: 'cover is not an image' };
    if (Number(res.headers.get('content-length') ?? 0) > MAX_BYTES) return { error: 'cover image too large (max 8MB)' };

    const body = await res.arrayBuffer();
    if (body.byteLength > MAX_BYTES) return { error: 'cover image too large (max 8MB)' };

    const base = decodeURIComponent(parsed.pathname.split('/').pop() || 'cover').replace(/[^\w.-]+/g, '-').slice(0, 80) || 'cover';
    const ext = type.split('/')[1]?.replace('svg+xml', 'svg').replace('jpeg', 'jpg') ?? 'img';
    const filename = `media/${Date.now()}-${/\.\w{2,5}$/.test(base) ? base : `${base}.${ext}`}`;
    const blob = await put(filename, Buffer.from(body), { access: 'public', addRandomSuffix: false, contentType: type });
    return { url: blob.url };
  } catch (e) {
    return { error: e instanceof Error && e.message === 'private host' ? 'cover host is not allowed' : 'cover download failed' };
  }
}
