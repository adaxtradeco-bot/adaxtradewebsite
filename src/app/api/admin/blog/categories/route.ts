import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/api-auth';
import { CategoryInputSchema } from '@/lib/blog/schemas';
import { slugify } from '@/lib/blog/slug';
import { blogErrorResponse } from '@/lib/blog/route-errors';

export const dynamic = 'force-dynamic';

// GET /api/admin/blog/categories?language= - with post counts
export async function GET(request: NextRequest) {
  try {
    const auth = authenticateRequest(request);
    if (!auth.ok) return auth.response;

    const language = request.nextUrl.searchParams.get('language');
    const categories = await prisma.blogCategory.findMany({
      where: language ? { language } : undefined,
      include: { _count: { select: { posts: true } } },
      orderBy: [{ language: 'asc' }, { name: 'asc' }],
    });
    return NextResponse.json({ success: true, categories });
  } catch (error) {
    return blogErrorResponse(error);
  }
}

// POST /api/admin/blog/categories
export async function POST(request: NextRequest) {
  try {
    const auth = authenticateRequest(request);
    if (!auth.ok) return auth.response;

    const input = CategoryInputSchema.parse(await request.json());
    const category = await prisma.blogCategory.create({
      data: { ...input, slug: slugify(input.slug ?? input.name) || 'category' },
    });
    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (error) {
    return blogErrorResponse(error);
  }
}
