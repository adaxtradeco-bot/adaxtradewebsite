import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const LANG_RE = /^(en|ar|tr|fr|de|es)$/i;

function normalizePath(input: string): string {
  const decoded = decodeURIComponent(input).trim();
  if (!decoded) return '';

  const withLeading = decoded.startsWith('/') ? decoded : `/${decoded}`;
  const collapsed = withLeading.replace(/\/{2,}/g, '/');

  if (collapsed.length > 1 && collapsed.endsWith('/')) {
    return collapsed.slice(0, -1);
  }

  return collapsed;
}

function buildSlugCandidates(rawSlug: string): string[] {
  const normalized = normalizePath(rawSlug);
  if (!normalized) return [];

  const candidates = new Set<string>();

  const pushBoth = (value: string) => {
    if (!value) return;
    candidates.add(value);
    candidates.add(value.startsWith('/') ? value.slice(1) : `/${value}`);
  };

  pushBoth(normalized);

  const parts = normalized.split('/').filter(Boolean);
  const hasLangPrefix = parts.length > 1 && LANG_RE.test(parts[0]);
  const rest = hasLangPrefix ? parts.slice(1) : parts;

  if (hasLangPrefix) {
    pushBoth(`/${rest.join('/')}`);
  }

  // Legacy fallback: some records were saved as flat hyphenated slugs.
  if (rest.length > 1) {
    const hyphenPath = rest.join('-');
    pushBoth(`/${hyphenPath}`);

    if (hasLangPrefix) {
      pushBoth(`/${parts[0]}/${hyphenPath}`);
      pushBoth(`/${parts[0]}-${hyphenPath}`);
    }
  }

  return Array.from(candidates).filter(Boolean);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    const slugCandidates = buildSlugCandidates(slug);
    if (!slugCandidates.length) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    console.log('API: Looking for page with slug candidates:', slugCandidates);

    let page = null;
    for (const candidate of slugCandidates) {
      const found = await prisma.page.findUnique({
        where: { slug: candidate },
      });
      if (found && found.status === 'published') {
        page = found;
        break;
      }
    }

    if (!page) {
      console.log('API: Page not found in database');
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    console.log('API: Page found:', {
      id: page.id,
      title: page.title,
      status: page.status,
      slug: page.slug,
    });

    let builderData = null;
    if (page.builderData) {
      const parsed = JSON.parse(page.builderData);
      builderData = parsed.sections || parsed;
      console.log(
        'API: Builder data parsed, sections count:',
        Array.isArray(builderData) ? builderData.length : 'not array'
      );
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
