/**
 * API Route: Create Page Group
 * POST /api/admin/page-groups
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    try {
      jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, defaultLanguage, pageIds } = body;

    // Validation
    if (!name || !slug || !defaultLanguage || !pageIds || pageIds.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingGroup = await prisma.pageGroup.findUnique({
      where: { slug }
    });

    if (existingGroup) {
      return NextResponse.json(
        { error: 'A group with this slug already exists' },
        { status: 400 }
      );
    }

    // Create group
    const group = await prisma.pageGroup.create({
      data: {
        name,
        slug,
        defaultLanguage
      }
    });

    // Update pages to link to this group
    await prisma.page.updateMany({
      where: {
        id: { in: pageIds }
      },
      data: {
        pageGroupId: group.id
      }
    });

    return NextResponse.json({
      success: true,
      data: group
    });

  } catch (error: any) {
    console.error('Error creating page group:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create page group' },
      { status: 500 }
    );
  }
}
