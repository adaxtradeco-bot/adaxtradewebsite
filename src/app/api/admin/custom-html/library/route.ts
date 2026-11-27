/**
 * Custom HTML section library — list and create.
 * Spec: docs/custom-html-section-spec.md §12
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest, authorizeCode } from '@/lib/api-auth';
import { CUSTOM_HTML_TYPE } from '@/lib/custom-html/types';
import {
  LIBRARY_CATEGORY,
  LIBRARY_SUMMARY_SELECT,
  cleanLibraryDescription,
  cleanLibraryName,
  prepareLibraryData,
} from '@/lib/custom-html/library';

export const dynamic = 'force-dynamic';

function bad(error: string) {
  return NextResponse.json({ success: false, error }, { status: 400 });
}

export async function GET(request: NextRequest) {
  const auth = authenticateRequest(request);
  if (!auth.ok) return auth.response;

  try {
    const items = await prisma.sectionTemplate.findMany({
      where: { type: CUSTOM_HTML_TYPE },
      select: LIBRARY_SUMMARY_SELECT,
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error('Custom HTML library list error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load the library' }, { status: 500 });
  }
}

/** Body: { name?, description?, data: CustomHtmlData }. values / runInBuilder / libraryId are not saved. */
export async function POST(request: NextRequest) {
  const auth = authorizeCode(request);
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return bad('Invalid JSON body');
  }
  if (!body || typeof body !== 'object') return bad('Invalid body');
  const { name: rawName, description: rawDescription, data } = body as Record<string, unknown>;

  const fallbackName = (data as { name?: unknown } | null | undefined)?.name;
  const name = cleanLibraryName(rawName === undefined ? fallbackName : rawName);
  if (!name) return bad('A name of 1 to 200 characters is required');
  const description = cleanLibraryDescription(rawDescription);
  if (description === null) return bad('description must be a string of at most 1000 characters');
  const parsed = prepareLibraryData(data, name);
  if (!parsed.success) return bad('Invalid custom HTML data: ' + parsed.error);

  try {
    const item = await prisma.sectionTemplate.create({
      data: {
        name,
        description,
        type: CUSTOM_HTML_TYPE,
        category: LIBRARY_CATEGORY,
        defaultData: JSON.stringify(parsed.data),
      },
      select: LIBRARY_SUMMARY_SELECT,
    });
    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch (error) {
    console.error('Custom HTML library create error:', error);
    return NextResponse.json({ success: false, error: 'Failed to save to the library' }, { status: 500 });
  }
}
