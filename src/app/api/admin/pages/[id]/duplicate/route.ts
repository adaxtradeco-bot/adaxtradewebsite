/**
 * POST /api/admin/pages/[id]/duplicate
 * Copies a page (builderData, sections, SEO, header override) into a new draft.
 * The copy is never the homepage, never a default-language page and is not put
 * in a page group unless the caller asks (`keepGroup: true`).
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/api-auth';

const MAX_SLUG_TRIES = 50;

function normalizeSlug(raw: string): string {
  const s = raw.trim().replace(/\s+/g, '-').replace(/\/{2,}/g, '/');
  return s.startsWith('/') ? s : `/${s}`;
}

async function uniqueSlug(base: string): Promise<string | null> {
  for (let i = 1; i <= MAX_SLUG_TRIES; i++) {
    const candidate = i === 1 ? `${base}-copy` : `${base}-copy-${i}`;
    const hit = await prisma.page.findUnique({ where: { slug: candidate }, select: { id: true } });
    if (!hit) return candidate;
  }
  return null;
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = authenticateRequest(request);
    if (!auth.ok) return auth.response;

    let body: { title?: unknown; slug?: unknown; keepGroup?: unknown } = {};
    try {
      body = await request.json();
    } catch {
      // empty body is fine
    }

    const source = await prisma.page.findUnique({ where: { id: params.id } });
    if (!source) {
      return NextResponse.json({ success: false, error: 'Page not found' }, { status: 404 });
    }

    const title =
      typeof body.title === 'string' && body.title.trim() ? body.title.trim() : `${source.title} copy`;

    let slug: string;
    if (typeof body.slug === 'string' && body.slug.trim()) {
      slug = normalizeSlug(body.slug);
      const taken = await prisma.page.findUnique({ where: { slug }, select: { id: true } });
      if (taken) {
        return NextResponse.json(
          { success: false, error: 'Slug already exists. Please choose a different slug.' },
          { status: 409 }
        );
      }
    } else {
      const generated = await uniqueSlug(source.slug);
      if (!generated) {
        return NextResponse.json(
          { success: false, error: 'Could not generate a unique slug' },
          { status: 409 }
        );
      }
      slug = generated;
    }

    const page = await prisma.page.create({
      data: {
        title,
        slug,
        status: 'draft',
        language: source.language,
        metaTitle: source.metaTitle,
        metaDescription: source.metaDescription,
        sections: source.sections,
        builderData: source.builderData,
        isBuilderPage: source.isBuilderPage,
        builderVersion: source.builderVersion,
        headerOverride: source.headerOverride,
        isHomepage: false,
        isDefaultLang: false,
        ...(body.keepGroup === true && source.pageGroupId ? { pageGroupId: source.pageGroupId } : {}),
      },
    });

    return NextResponse.json({ success: true, page }, { status: 201 });
  } catch (error) {
    console.error('Page duplicate error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
