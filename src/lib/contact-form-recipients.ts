/**
 * Allowed recipients for the public contact-form endpoint.
 *
 * The form posts its `destinationEmail` from the page, but the server must
 * never mail an arbitrary address (open relay). An address is accepted only
 * when the site owner configured it:
 *   - as `data.destinationEmail` of a `contact-form` section stored in a Page
 *     (any status — only admins write pages) or an admin-authored blog Post
 *     (API-key posts are excluded: those keys are for external writers), or
 *   - in the env allowlist CONTACT_FORM_ALLOWED_RECIPIENTS (comma-separated),
 *     for forms that are not stored in the database (hard-coded pages).
 */

import { prisma } from './prisma';

const CACHE_TTL_MS = 60 * 1000;
const MISS_REFRESH_MS = 10 * 1000;
const MAX_DEPTH = 20;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Collect `destinationEmail` of every `contact-form` section in parsed builder JSON (any nesting). */
export function extractContactFormRecipients(value: unknown, out: Set<string> = new Set(), depth = 0): Set<string> {
  if (depth > MAX_DEPTH || value === null || typeof value !== 'object') return out;

  if (Array.isArray(value)) {
    for (const item of value) extractContactFormRecipients(item, out, depth + 1);
    return out;
  }

  const record = value as Record<string, unknown>;
  if (record.type === 'contact-form') {
    const data = record.data as Record<string, unknown> | undefined;
    const email = data && typeof data.destinationEmail === 'string' ? normalizeEmail(data.destinationEmail) : '';
    if (email) out.add(email);
  }
  for (const child of Object.values(record)) extractContactFormRecipients(child, out, depth + 1);
  return out;
}

/** Recipients from stored JSON strings (Page.builderData / Page.sections / Post.builderData). */
export function recipientsFromStoredJson(jsonStrings: Array<string | null | undefined>, out: Set<string> = new Set()): Set<string> {
  for (const json of jsonStrings) {
    if (!json || !json.includes('contact-form')) continue;
    try {
      extractContactFormRecipients(JSON.parse(json), out);
    } catch {
      // Malformed page JSON: ignore it, it cannot render a form either.
    }
  }
  return out;
}

export function parseRecipientList(value: string | undefined): Set<string> {
  return new Set(
    (value ?? '')
      .split(',')
      .map(normalizeEmail)
      .filter(Boolean)
  );
}

async function loadStoredRecipients(): Promise<Set<string>> {
  const [pages, posts] = await Promise.all([
    prisma.page.findMany({ select: { builderData: true, sections: true } }),
    prisma.post.findMany({ where: { source: 'admin' }, select: { builderData: true } }),
  ]);
  return recipientsFromStoredJson([
    ...pages.flatMap((p) => [p.builderData, p.sections]),
    ...posts.map((p) => p.builderData),
  ]);
}

let cache: { loadedAt: number; recipients: Promise<Set<string>> } | null = null;

/** Clears the cached allowlist (tests, or after a page save if ever needed). */
export function clearRecipientCache() {
  cache = null;
}

function loadIntoCache(now: number): Promise<Set<string>> {
  const recipients = loadStoredRecipients();
  cache = { loadedAt: now, recipients };
  // Do not keep a failed lookup cached.
  recipients.catch(() => {
    if (cache?.recipients === recipients) cache = null;
  });
  return recipients;
}

export async function isAllowedRecipient(email: string): Promise<boolean> {
  const target = normalizeEmail(email);
  if (!target) return false;

  if (parseRecipientList(process.env.CONTACT_FORM_ALLOWED_RECIPIENTS).has(target)) return true;
  // The site's own contact address (used by the hard-coded contact-sales page),
  // only when the owner actually configured it.
  if (parseRecipientList(process.env.NEXT_PUBLIC_CONTACT_EMAIL).has(target)) return true;

  const now = Date.now();
  const current = cache && now - cache.loadedAt < CACHE_TTL_MS ? cache : null;
  if (!current) return (await loadIntoCache(now)).has(target);
  if ((await current.recipients).has(target)) return true;

  // Miss on a cache older than a few seconds: reload once so an address the
  // owner just saved in the builder works right away. Unknown addresses can
  // therefore trigger at most one DB read per MISS_REFRESH_MS.
  if (now - current.loadedAt >= MISS_REFRESH_MS && cache === current) {
    return (await loadIntoCache(now)).has(target);
  }
  return false;
}
