import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export type ApiScope = 'blog:write';

const RATE_LIMIT = 60;
const WINDOW_MS = 60_000;
// In-memory sliding window: per server instance only, so serverless deployments get a looser effective limit.
const hits = new Map<string, number[]>();

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');
const error = (status: number, code: string, headers?: Record<string, string>) =>
  NextResponse.json({ error: code }, { status, headers });

export function generateApiKey() {
  const prefix = randomBytes(4).toString('hex'); // 8 chars
  const key = `bk_${prefix}_${randomBytes(24).toString('base64url')}`; // 32-char secret
  return { key, prefix, hashedKey: sha256(key) };
}

export const parseScopes = (csv: string) =>
  csv.split(',').map((s) => s.trim()).filter(Boolean);

function rateLimited(keyId: string): number | null {
  const now = Date.now();
  const recent = (hits.get(keyId) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= RATE_LIMIT) {
    hits.set(keyId, recent);
    return Math.max(1, Math.ceil((recent[0] + WINDOW_MS - now) / 1000));
  }
  recent.push(now);
  hits.set(keyId, recent);
  return null;
}

type KeyRow = NonNullable<Awaited<ReturnType<typeof prisma.apiKey.findUnique>>>;
type VerifyResult = { ok: true; key: KeyRow } | { ok: false; response: NextResponse };

export async function verifyApiKey(request: Request, scope: ApiScope): Promise<VerifyResult> {
  const invalid = { ok: false as const, response: error(401, 'invalid_api_key') };
  const token = request.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
  const match = token?.match(/^bk_([0-9a-f]{8})_.+$/);
  if (!token || !match) return invalid;

  const row = await prisma.apiKey.findUnique({ where: { prefix: match[1] } });
  if (!row || row.revokedAt) return invalid;

  const given = Buffer.from(sha256(token));
  const stored = Buffer.from(row.hashedKey);
  if (given.length !== stored.length || !timingSafeEqual(given, stored)) return invalid;

  if (!parseScopes(row.scopes).includes(scope)) return { ok: false, response: error(403, 'insufficient_scope') };

  const retryAfter = rateLimited(row.id);
  if (retryAfter !== null) return { ok: false, response: error(429, 'rate_limited', { 'Retry-After': String(retryAfter) }) };

  await prisma.apiKey.update({ where: { id: row.id }, data: { lastUsedAt: new Date() } });
  return { ok: true, key: row };
}

/** `blog.apiCanPublish` from SiteSettings.data (default false). */
export async function getApiCanPublish(): Promise<boolean> {
  try {
    const settings = await prisma.siteSettings.findFirst();
    return JSON.parse(settings?.data ?? '{}')?.blog?.apiCanPublish === true;
  } catch {
    return false;
  }
}
