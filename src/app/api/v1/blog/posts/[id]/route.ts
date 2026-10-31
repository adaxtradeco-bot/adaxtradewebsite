import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyApiKey } from '@/lib/blog/api-keys';
import { updatePost } from '@/lib/blog/post-service';
import { ApiUpdatePostSchema } from '@/lib/blog/schemas';
import { apiError, applyPublishPolicy, bodyToFields, postLinks, postSummary, readJson, resolveCover, serviceError, validationError } from '../../_lib';

export const dynamic = 'force-dynamic';

type Ctx = { params: { id: string } };

export async function GET(request: NextRequest, { params }: Ctx) {
  const auth = await verifyApiKey(request, 'blog:write');
  if (!auth.ok) return auth.response;

  const post = await prisma.post.findUnique({ where: { id: params.id }, include: { category: true, tags: true } });
  if (!post) return apiError(404, 'not_found', 'Post not found');
  const { builderData, category, tags, ...rest } = post;
  return NextResponse.json({
    ...rest,
    category: category && { id: category.id, name: category.name, slug: category.slug },
    tags: tags.map((t) => ({ id: t.id, name: t.name, slug: t.slug })),
    sections: JSON.parse(builderData || '[]'),
    ...postLinks(request, post),
  });
}

export async function PATCH(request: NextRequest, { params }: Ctx) {
  const auth = await verifyApiKey(request, 'blog:write');
  if (!auth.ok) return auth.response;

  const body = await readJson(request);
  if ('response' in body) return body.response;
  const parsed = ApiUpdatePostSchema.safeParse(body.data);
  if (!parsed.success) return validationError(parsed.error.issues);

  try {
    const warnings: string[] = [];
    const { coverImageUrl, ...data } = await applyPublishPolicy(parsed.data, warnings);
    const coverImage = await resolveCover(coverImageUrl, warnings);

    const post = await updatePost(params.id, { ...data, ...bodyToFields(data), ...(coverImage && { coverImage }) });
    return NextResponse.json(postSummary(request, post, warnings));
  } catch (e) {
    return serviceError(e);
  }
}
