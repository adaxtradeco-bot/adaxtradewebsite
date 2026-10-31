import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateRequest } from '@/lib/api-auth';
import { addTranslation } from '@/lib/blog/post-service';
import { blogErrorResponse } from '@/lib/blog/route-errors';

export const dynamic = 'force-dynamic';

const BodySchema = z.object({ language: z.string().min(2).max(10) });

// POST /api/admin/blog/posts/[id]/add-translation - draft copy in another language, same group
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = authenticateRequest(request);
    if (!auth.ok) return auth.response;

    const { language } = BodySchema.parse(await request.json());
    const post = await addTranslation(params.id, language);
    return NextResponse.json({ success: true, post }, { status: 201 });
  } catch (error) {
    return blogErrorResponse(error);
  }
}
