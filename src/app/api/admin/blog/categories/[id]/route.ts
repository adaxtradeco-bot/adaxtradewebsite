import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest, authorizeDelete } from '@/lib/api-auth';
import { slugify } from '@/lib/blog/slug';
import { blogErrorResponse } from '@/lib/blog/route-errors';
import { CategoryInputSchema } from '@/lib/blog/schemas';

export const dynamic = 'force-dynamic';

type Ctx = { params: { id: string } };

// PUT /api/admin/blog/categories/[id] - edit, including linking via groupKey
export async function PUT(request: NextRequest, { params }: Ctx) {
  try {
    const auth = authenticateRequest(request);
    if (!auth.ok) return auth.response;

    const input = CategoryInputSchema.partial().parse(await request.json());
    const category = await prisma.blogCategory.update({
      where: { id: params.id },
      data: { ...input, ...(input.slug && { slug: slugify(input.slug) }) },
    });
    return NextResponse.json({ success: true, category });
  } catch (error) {
    return blogErrorResponse(error);
  }
}

// DELETE /api/admin/blog/categories/[id] - posts keep existing, categoryId becomes null
export async function DELETE(request: NextRequest, { params }: Ctx) {
  try {
    const auth = authorizeDelete(request);
    if (!auth.ok) return auth.response;

    await prisma.blogCategory.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return blogErrorResponse(error);
  }
}
