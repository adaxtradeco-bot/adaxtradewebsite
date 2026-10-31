import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateRequest, authorizeDelete } from '@/lib/api-auth';
import { bulkDelete, bulkUpdateStatus } from '@/lib/blog/post-service';
import { blogErrorResponse } from '@/lib/blog/route-errors';

export const dynamic = 'force-dynamic';

const BodySchema = z.object({
  ids: z.array(z.string()).min(1).max(200),
  action: z.enum(['publish', 'draft', 'archive', 'delete']),
});

const STATUS_BY_ACTION = { publish: 'published', draft: 'draft', archive: 'archived' } as const;

// POST /api/admin/blog/posts/bulk - bulk status change or delete
export async function POST(request: NextRequest) {
  try {
    const body = BodySchema.parse(await request.json());

    const auth = body.action === 'delete' ? authorizeDelete(request) : authenticateRequest(request);
    if (!auth.ok) return auth.response;

    const count =
      body.action === 'delete'
        ? await bulkDelete(body.ids)
        : await bulkUpdateStatus(body.ids, STATUS_BY_ACTION[body.action]);
    return NextResponse.json({ success: true, count });
  } catch (error) {
    return blogErrorResponse(error);
  }
}
