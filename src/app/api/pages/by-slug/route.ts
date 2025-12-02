import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    const page = await prisma.page.findUnique({
      where: { slug },
    });

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    let builderData = null;
    if (page.builderData) {
      const parsed = JSON.parse(page.builderData);
      builderData = parsed.sections || parsed;
    }

    return NextResponse.json({
      page: {
        ...page,
        builderData,
      },
    });
  } catch (error) {
    console.error('Get page by slug error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
