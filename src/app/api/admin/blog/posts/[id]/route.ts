import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest, authorizeDelete } from '@/lib/api-auth';
import { deletePost, updatePost } from '@/lib/blog/post-service';
import { PostUpdateSchema } from '@/lib/blog/schemas';
import { blogErrorResponse } from '@/lib/blog/route-errors';

export const dynamic = 'force-dynamic';

type Ctx = { params: { id: string } };

// GET /api/admin/blog/posts/[id] - post with taxonomy, author and language siblings
export async function GET(request: NextRequest, { params }: Ctx) {
  try {
    const auth = authenticateRequest(request);
    if (!auth.ok) return auth.response;

    const post = await prisma.post.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        tags: true,
        author: { select: { id: true, name: true } },
        postGroup: { select: { posts: { select: { id: true, language: true, slug: true } } } },
      },
    });
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

    const { postGroup, ...rest } = post;
    return NextResponse.json({ success: true, post: { ...rest, siblings: postGroup?.posts ?? [] } });
  } catch (error) {
    return blogErrorResponse(error);
  }
}

// PUT /api/admin/blog/posts/[id] - update
export async function PUT(request: NextRequest, { params }: Ctx) {
  try {
    const auth = authenticateRequest(request);
    if (!auth.ok) return auth.response;

    const post = await updatePost(params.id, PostUpdateSchema.parse(await request.json()));
    return NextResponse.json({ success: true, post });
  } catch (error) {
    return blogErrorResponse(error);
  }
}

// DELETE /api/admin/blog/posts/[id]
export async function DELETE(request: NextRequest, { params }: Ctx) {
  try {
    const auth = authorizeDelete(request);
    if (!auth.ok) return auth.response;

    await deletePost(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return blogErrorResponse(error);
  }
}
