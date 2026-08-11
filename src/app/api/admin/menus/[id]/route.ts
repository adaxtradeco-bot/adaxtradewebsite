import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest, authorizeDelete } from '@/lib/api-auth';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = authenticateRequest(request);
    if (!auth.ok) return auth.response;

    const menu = await prisma.menu.findUnique({
      where: { id: params.id },
    });

    if (!menu) {
      return NextResponse.json({ error: 'Menu not found' }, { status: 404 });
    }

    return NextResponse.json({ menu });
  } catch (error) {
    console.error('Menu GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = authenticateRequest(request);
    if (!auth.ok) return auth.response;

    const data = await request.json();

    const menu = await prisma.menu.update({
      where: { id: params.id },
      data: {
        name: data.name,
        location: data.location,
        language: data.language,
        items: data.items,
        status: data.status,
      },
    });

    return NextResponse.json({ menu });
  } catch (error) {
    console.error('Menu PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = authorizeDelete(request);
    if (!auth.ok) return auth.response;

    await prisma.menu.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Menu DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
