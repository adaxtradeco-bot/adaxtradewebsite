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

    console.log('API: Looking for page with slug:', slug);

    const page = await prisma.page.findUnique({
      where: { slug },
    });

    if (!page) {
      console.log('API: Page not found in database');
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    console.log('API: Page found:', { id: page.id, title: page.title, status: page.status });

    // چک کردن status صفحه - فقط published رو نمایش بده
    if (page.status !== 'published') {
      console.log('API: Page is not published, status:', page.status);
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    let builderData = null;
    if (page.builderData) {
      const parsed = JSON.parse(page.builderData);
      builderData = parsed.sections || parsed;
      console.log('API: Builder data parsed, sections count:', Array.isArray(builderData) ? builderData.length : 'not array');
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
