import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/api-auth';
import { TagInputSchema } from '@/lib/blog/schemas';
import { slugify } from '@/lib/blog/slug';
import { blogErrorResponse } from '@/lib/blog/route-errors';

export const dynamic = 'force-dynamic';

// GET /api/admin/blog/tags?language= - with post counts
export async function GET(request: NextRequest) {
  try {
    const auth = authenticateRequest(request);
    if (!auth.ok) return auth.response;

    const language = request.nextUrl.searchParams.get('language');
    const tags = await prisma.blogTag.findMany({
      where: language ? { language } : undefined,
      include: { _count: { select: { posts: true } } },
      orderBy: [{ language: 'asc' }, { name: 'asc' }],
    });
    return NextResponse.json({ success: true, tags });
  } catch (error) {
    return blogErrorResponse(error);
  }
}

// POST /api/admin/blog/tags
export async function POST(request: NextRequest) {
  try {
    const auth = authenticateRequest(request);
    if (!auth.ok) return auth.response;

    const input = TagInputSchema.parse(await request.json());
    const tag = await prisma.blogTag.create({
      data: { ...input, slug: slugify(input.slug ?? input.name) || 'tag' },
    });
    return NextResponse.json({ success: true, tag }, { status: 201 });
  } catch (error) {
    return blogErrorResponse(error);
  }
}
