import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyApiKey } from '@/lib/blog/api-keys';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = await verifyApiKey(request, 'blog:write');
  if (!auth.ok) return auth.response;

  const language = request.nextUrl.searchParams.get('language');
  const items = await prisma.blogCategory.findMany({
    where: language ? { language } : undefined,
    select: { id: true, name: true, slug: true, language: true },
    orderBy: { name: 'asc' },
  });
  return NextResponse.json({ items });
}
