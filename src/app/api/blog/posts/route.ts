import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { visiblePostWhere } from '@/lib/blog/visibility';
import { supportedLanguages } from '@/lib/i18n/config';

export const dynamic = 'force-dynamic';

/** Public read API: latest visible posts for a language (used by the latest-posts section). */
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const language = sp.get('language');
  if (!language || !supportedLanguages.includes(language)) {
    return NextResponse.json({ error: 'A valid "language" query parameter is required' }, { status: 400 });
  }
  const parsed = parseInt(sp.get('limit') ?? '', 10);
  const limit = Number.isNaN(parsed) ? 3 : Math.min(24, Math.max(1, parsed));
  const categorySlug = sp.get('categorySlug');
  const tagSlug = sp.get('tagSlug');

  const posts = await prisma.post.findMany({
    where: {
      language,
      ...visiblePostWhere(),
      ...(categorySlug && { category: { slug: categorySlug } }),
      ...(tagSlug && { tags: { some: { slug: tagSlug } } }),
    },
    include: {
      category: { select: { name: true, slug: true } },
      author: { select: { name: true } },
    },
    orderBy: [{ publishedAt: 'desc' }, { scheduledAt: 'desc' }],
    take: limit,
  });

  return NextResponse.json({
    posts: posts.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      coverImage: p.coverImage,
      coverImageAlt: p.coverImageAlt,
      publishedAt: p.publishedAt ?? p.scheduledAt,
      category: p.category ? { name: p.category.name, slug: p.category.slug } : null,
      author: p.author ? { name: p.author.name } : null,
      url: `/${language}/blog/${p.slug}`,
    })),
  });
}
