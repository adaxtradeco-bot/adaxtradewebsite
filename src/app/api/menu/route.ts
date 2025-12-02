import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const location = request.nextUrl.searchParams.get('location') || 'header';
    const language = request.nextUrl.searchParams.get('language') || 'en';

    const menu = await prisma.menu.findUnique({
      where: {
        location_language: {
          location,
          language
        }
      }
    });

    if (!menu) {
      return NextResponse.json({ items: [] });
    }

    return NextResponse.json({ 
      items: JSON.parse(menu.items)
    });
  } catch (error) {
    console.error('Menu GET error:', error);
    return NextResponse.json({ items: [] });
  }
}
