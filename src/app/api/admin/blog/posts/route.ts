import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/api-auth';
import { createPost } from '@/lib/blog/post-service';
import { PostInputSchema } from '@/lib/blog/schemas';
import { blogErrorResponse } from '@/lib/blog/route-errors';

export const dynamic = 'force-dynamic';

// GET /api/admin/blog/posts - filtered, paginated list
export async function GET(request: NextRequest) {
  try {
    const auth = authenticateRequest(request);
    if (!auth.ok) return auth.response;

    const p = request.nextUrl.searchParams;
    const page = Math.max(1, Number(p.get('page')) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(p.get('pageSize')) || 20));
    const q = p.get('q');
    const where = {
      ...(p.get('language') && { language: p.get('language')! }),
      ...(p.get('status') && { status: p.get('status')! }),
      ...(p.get('categoryId') && { categoryId: p.get('categoryId')! }),
      ...(p.get('authorId') && { authorId: p.get('authorId')! }),
      ...(q && { title: { contains: q, mode: 'insensitive' as const } }),
    };

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        select: {
          id: true, title: true, slug: true, language: true, status: true, source: true,
          publishedAt: true, scheduledAt: true, updatedAt: true, postGroupId: true,
          category: { select: { id: true, name: true } },
          author: { select: { id: true, name: true } },
        },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.post.count({ where }),
    ]);

    return NextResponse.json({ posts, total, page, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
  } catch (error) {
    return blogErrorResponse(error);
  }
}

// POST /api/admin/blog/posts - create
export async function POST(request: NextRequest) {
  try {
    const auth = authenticateRequest(request);
    if (!auth.ok) return auth.response;

    const input = PostInputSchema.parse(await request.json());
    const { post } = await createPost(
      { ...input, authorId: input.authorId ?? auth.user.id },
      { source: 'admin' }
    );
    return NextResponse.json({ success: true, post }, { status: 201 });
  } catch (error) {
    return blogErrorResponse(error);
  }
}
