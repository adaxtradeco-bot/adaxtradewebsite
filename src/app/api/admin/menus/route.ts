import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  try {
    const auth = authenticateRequest(request);
    if (!auth.ok) return auth.response;

    const menus = await prisma.menu.findMany({
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ 
      menus: menus.map(menu => ({
        ...menu,
        items: JSON.parse(menu.items || '[]')
      }))
    });
  } catch (error) {
    console.error('Menus GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = authenticateRequest(request);
    if (!auth.ok) return auth.response;

    const data = await request.json();

    const menu = await prisma.menu.create({
      data: {
        name: data.name,
        location: data.location,
        language: data.language || 'en',
        items: data.items || '[]',
        status: data.status || 'active',
      },
    });

    return NextResponse.json({ menu });
  } catch (error) {
    console.error('Menus POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
