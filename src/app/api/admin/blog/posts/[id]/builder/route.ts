import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/api-auth';
import { updatePost } from '@/lib/blog/post-service';
import { blogErrorResponse } from '@/lib/blog/route-errors';
import { BaseSectionSchema } from '@/lib/page-builder/section-schemas';

export const dynamic = 'force-dynamic';

type Ctx = { params: { id: string } };

const BuilderBodySchema = z.object({ builderData: z.array(BaseSectionSchema) });

// GET /api/admin/blog/posts/[id]/builder - post for the page builder
export async function GET(request: NextRequest, { params }: Ctx) {
  try {
    const auth = authenticateRequest(request);
    if (!auth.ok) return auth.response;

    const post = await prisma.post.findUnique({
      where: { id: params.id },
      select: { id: true, title: true, slug: true, status: true, language: true, builderData: true },
    });
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

    let builderData: unknown[] = [];
    try {
      const parsed = post.builderData ? JSON.parse(post.builderData) : [];
      if (Array.isArray(parsed)) builderData = parsed;
    } catch (error) {
      console.error('Failed to parse post builder data:', error);
    }
    return NextResponse.json({ success: true, post: { ...post, builderData } });
  } catch (error) {
    return blogErrorResponse(error);
  }
}

// PUT /api/admin/blog/posts/[id]/builder - save sections (sanitized by the service)
export async function PUT(request: NextRequest, { params }: Ctx) {
  try {
    const auth = authenticateRequest(request);
    if (!auth.ok) return auth.response;

    const { builderData } = BuilderBodySchema.parse(await request.json());
    await updatePost(params.id, { sections: builderData });
    return NextResponse.json({ success: true });
  } catch (error) {
    return blogErrorResponse(error);
  }
}
