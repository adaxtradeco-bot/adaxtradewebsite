/**
 * Custom HTML section library — read, update, delete one item.
 * Spec: docs/custom-html-section-spec.md §12
 *
 * Every query is restricted to type 'custom-html', so these handlers can neither touch other section
 * templates nor change a row's type. Editing an item never changes sections already placed on pages.
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest, authorizeCode } from '@/lib/api-auth';
import { CUSTOM_HTML_TYPE } from '@/lib/custom-html/types';
import {
  LIBRARY_SUMMARY_SELECT,
  cleanLibraryDescription,
  cleanLibraryName,
  prepareLibraryData,
  readLibraryData,
} from '@/lib/custom-html/library';

export const dynamic = 'force-dynamic';

type Context = { params: { id: string } };

function fail(status: number, error: string) {
  return NextResponse.json({ success: false, error }, { status });
}

function findItem(id: string) {
  return prisma.sectionTemplate.findFirst({ where: { id, type: CUSTOM_HTML_TYPE } });
}

/** Full item. With ?insert=1 (the picker placing a copy on a page) usageCount is incremented. */
export async function GET(request: NextRequest, { params }: Context) {
  const auth = authenticateRequest(request);
  if (!auth.ok) return auth.response;

  try {
    const row = await findItem(params.id);
    if (!row) return fail(404, 'Library item not found');
    const parsed = readLibraryData(row.defaultData, row.name);
    if (!parsed.success) return fail(422, 'This library item is invalid: ' + parsed.error);

    let usageCount = row.usageCount;
    if (new URL(request.url).searchParams.get('insert') === '1') {
      await prisma.sectionTemplate.updateMany({
        where: { id: row.id, type: CUSTOM_HTML_TYPE },
        data: { usageCount: { increment: 1 } },
      });
      usageCount += 1;
    }

    return NextResponse.json({
      success: true,
      item: {
        id: row.id,
        name: row.name,
        description: row.description,
        usageCount,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        data: parsed.data,
      },
    });
  } catch (error) {
    console.error('Custom HTML library read error:', error);
    return fail(500, 'Failed to load the library item');
  }
}

/** Body: any of { name, description, data }. */
export async function PUT(request: NextRequest, { params }: Context) {
  const auth = authorizeCode(request);
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, 'Invalid JSON body');
  }
  if (!body || typeof body !== 'object') return fail(400, 'Invalid body');
  const { name: rawName, description: rawDescription, data } = body as Record<string, unknown>;
  if (rawName === undefined && rawDescription === undefined && data === undefined) {
    return fail(400, 'Nothing to update');
  }

  const changes: { name?: string; description?: string; defaultData?: string } = {};
  if (rawName !== undefined) {
    const name = cleanLibraryName(rawName);
    if (!name) return fail(400, 'A name of 1 to 200 characters is required');
    changes.name = name;
  }
  if (rawDescription !== undefined) {
    const description = cleanLibraryDescription(rawDescription);
    if (description === null) return fail(400, 'description must be a string of at most 1000 characters');
    changes.description = description;
  }

  try {
    const row = await findItem(params.id);
    if (!row) return fail(404, 'Library item not found');
    if (data !== undefined) {
      const parsed = prepareLibraryData(data, changes.name ?? row.name.slice(0, 200));
      if (!parsed.success) return fail(400, 'Invalid custom HTML data: ' + parsed.error);
      changes.defaultData = JSON.stringify(parsed.data);
    }
    const item = await prisma.sectionTemplate.update({
      where: { id: row.id },
      data: changes,
      select: LIBRARY_SUMMARY_SELECT,
    });
    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error('Custom HTML library update error:', error);
    return fail(500, 'Failed to update the library item');
  }
}

export async function DELETE(request: NextRequest, { params }: Context) {
  const auth = authorizeCode(request);
  if (!auth.ok) return auth.response;

  try {
    const { count } = await prisma.sectionTemplate.deleteMany({
      where: { id: params.id, type: CUSTOM_HTML_TYPE },
    });
    if (!count) return fail(404, 'Library item not found');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Custom HTML library delete error:', error);
    return fail(500, 'Failed to delete the library item');
  }
}
