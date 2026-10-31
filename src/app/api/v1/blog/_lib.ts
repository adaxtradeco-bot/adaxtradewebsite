import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiCanPublish } from '@/lib/blog/api-keys';
import { contentToSections, htmlToSections } from '@/lib/blog/blocks-to-sections';
import { importCover } from '@/lib/blog/cover-import';
import { BlogServiceError } from '@/lib/blog/post-service';

const MAX_BODY = 1024 * 1024;

export const apiError = (status: number, error: string, message?: string) =>
  NextResponse.json({ error, ...(message && { message }) }, { status });

/** Reads and parses the JSON body; enforces the 1 MB limit. */
export async function readJson(request: Request): Promise<{ data: unknown } | { response: NextResponse }> {
  if (Number(request.headers.get('content-length') ?? 0) > MAX_BODY) return { response: apiError(413, 'payload_too_large') };
  const text = await request.text();
  if (text.length > MAX_BODY) return { response: apiError(413, 'payload_too_large') };
  try {
    return { data: JSON.parse(text) };
  } catch {
    return { response: apiError(400, 'invalid_json') };
  }
}

export const validationError = (issues: { path: PropertyKey[]; message: string }[]) =>
  NextResponse.json(
    { error: 'validation_error', issues: issues.map((i) => ({ path: i.path.map(String).join('.'), message: i.message })) },
    { status: 422 }
  );

export function serviceError(e: unknown) {
  if (e instanceof BlogServiceError) return apiError(e.status, e.code, e.message);
  console.error('Blog API error:', e);
  return apiError(500, 'internal_error');
}

// Tiny local helper; a shared one will own this later.
function baseUrl(request: Request) {
  return (process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin).replace(/\/$/, '');
}

export function postLinks(request: Request, post: { id: string; language: string; slug: string }) {
  const base = baseUrl(request);
  return { url: `${base}/${post.language}/blog/${encodeURIComponent(post.slug)}`, previewUrl: `${base}/admin/blog/posts/${post.id}` };
}

export const postSummary = (request: Request, post: any, warnings: string[] = []) => ({
  id: post.id,
  slug: post.slug,
  status: post.status,
  ...postLinks(request, post),
  warnings,
});

type BodyFields = {
  sections?: any[];
  content?: any[];
  html?: string;
  seo?: { metaTitle?: string; metaDescription?: string; ogImage?: string; noindex?: boolean };
};

/** Maps content[] / html to sections and seo to flat fields; leaves `sections` as sent. */
export function bodyToFields(data: BodyFields) {
  const sections = data.content ? contentToSections(data.content) : data.html ? htmlToSections(data.html) : data.sections;
  return { ...(sections && { sections }), ...data.seo };
}

/** Downgrades published/scheduled to draft when API publishing is disabled. */
export async function applyPublishPolicy<T extends { status?: string }>(data: T, warnings: string[]): Promise<T> {
  if ((data.status === 'published' || data.status === 'scheduled') && !(await getApiCanPublish())) {
    warnings.push('status downgraded to draft: API publishing is disabled');
    return { ...data, status: 'draft' };
  }
  return data;
}

/** Imports the cover; on failure adds a warning and returns undefined. */
export async function resolveCover(url: string | undefined, warnings: string[]) {
  if (!url) return undefined;
  const result = await importCover(url);
  if ('error' in result) {
    warnings.push(`coverImageUrl not imported: ${result.error}`);
    return undefined;
  }
  return result.url;
}

export async function resolveAuthor(email: string | undefined, fallbackId: string | null, warnings: string[]) {
  if (!email) return fallbackId ?? undefined;
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (user) return user.id;
  warnings.push(`authorEmail not found: ${email}`);
  return fallbackId ?? undefined;
}
