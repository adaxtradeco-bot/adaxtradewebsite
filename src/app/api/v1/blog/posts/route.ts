import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyApiKey } from '@/lib/blog/api-keys';
import { createPost } from '@/lib/blog/post-service';
import { ApiCreatePostSchema, POST_STATUSES } from '@/lib/blog/schemas';
import { applyPublishPolicy, bodyToFields, postLinks, postSummary, readJson, resolveAuthor, resolveCover, serviceError, validationError } from '../_lib';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const auth = await verifyApiKey(request, 'blog:write');
  if (!auth.ok) return auth.response;

  const body = await readJson(request);
  if ('response' in body) return body.response;
  const parsed = ApiCreatePostSchema.safeParse(body.data);
  if (!parsed.success) return validationError(parsed.error.issues);

  try {
    const warnings: string[] = [];
    const { coverImageUrl, authorEmail, ...data } = await applyPublishPolicy(parsed.data, warnings);
    const coverImage = await resolveCover(coverImageUrl, warnings);
    const authorId = await resolveAuthor(authorEmail, auth.key.createdById, warnings);

    const { post, created } = await createPost(
      { ...data, ...bodyToFields(data), ...(coverImage && { coverImage }), authorId },
      { source: 'api' }
    );
    return NextResponse.json(postSummary(request, post, warnings), { status: created ? 201 : 200 });
  } catch (e) {
    return serviceError(e);
  }
}

export async function GET(request: NextRequest) {
  const auth = await verifyApiKey(request, 'blog:write');
  if (!auth.ok) return auth.response;

  const q = request.nextUrl.searchParams;
  const status = q.get('status');
  const limit = Math.min(Math.max(Number(q.get('limit')) || 20, 1), 100);
  const cursor = q.get('cursor');

  const rows = await prisma.post.findMany({
    where: {
      source: 'api',
      ...(q.get('language') && { language: q.get('language')! }),
      ...(status && (POST_STATUSES as readonly string[]).includes(status) && { status }),
      ...(q.get('externalId') && { externalId: q.get('externalId')! }),
    },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: limit + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
  });
  const page = rows.slice(0, limit);
  return NextResponse.json({
    items: page.map((p) => ({
      id: p.id, slug: p.slug, language: p.language, title: p.title, status: p.status,
      externalId: p.externalId, createdAt: p.createdAt, updatedAt: p.updatedAt, ...postLinks(request, p),
    })),
    nextCursor: rows.length > limit ? page[page.length - 1].id : null,
  });
}
