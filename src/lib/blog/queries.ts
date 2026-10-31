import { prisma } from '@/lib/prisma';
import { POSTS_PER_PAGE } from './constants';
import { visiblePostWhere } from './visibility';

export { POSTS_PER_PAGE };


const card = {
  category: { select: { id: true, name: true, slug: true } },
  author: { select: { id: true, name: true, avatar: true } },
} as const;

const full = {
  category: true,
  tags: true,
  author: { select: { id: true, name: true, avatar: true, bio: true } },
} as const;

/** Tidies admin data: a scheduled post whose time has passed becomes published. */
function flipIfDue<T extends { id: string; status: string; scheduledAt: Date | null }>(post: T, now: Date): T {
  if (post.status === 'scheduled' && post.scheduledAt && post.scheduledAt <= now) {
    prisma.post
      .updateMany({ where: { id: post.id, status: 'scheduled' }, data: { status: 'published', publishedAt: post.scheduledAt } })
      .catch(() => {});
  }
  return post;
}

/** `includeHidden` is for previews by a logged-in user. */
export async function getPostBySlug(language: string, slug: string, opts: { includeHidden?: boolean } = {}) {
  const now = new Date();
  const post = await prisma.post.findFirst({
    where: { language, slug, ...(opts.includeHidden ? {} : visiblePostWhere(now)) },
    include: full,
  });
  return post && flipIfDue(post, now);
}

export async function listPosts(opts: { language: string; page?: number; categorySlug?: string; tagSlug?: string }) {
  const page = Math.max(1, opts.page ?? 1);
  const where = {
    language: opts.language,
    ...visiblePostWhere(),
    ...(opts.categorySlug && { category: { slug: opts.categorySlug } }),
    ...(opts.tagSlug && { tags: { some: { slug: opts.tagSlug } } }),
  };
  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: card,
      orderBy: [{ publishedAt: 'desc' }, { scheduledAt: 'desc' }],
      skip: (page - 1) * POSTS_PER_PAGE,
      take: POSTS_PER_PAGE,
    }),
    prisma.post.count({ where }),
  ]);
  return { posts, total, page, totalPages: Math.max(1, Math.ceil(total / POSTS_PER_PAGE)) };
}

/** Same category and language, newest first. */
export async function getRelatedPosts(post: { id: string; language: string; categoryId: string | null }, limit = 3) {
  if (!post.categoryId) return [];
  return prisma.post.findMany({
    where: { language: post.language, categoryId: post.categoryId, id: { not: post.id }, ...visiblePostWhere() },
    include: card,
    orderBy: { publishedAt: 'desc' },
    take: limit,
  });
}

/** `{ lang: path }` for every visible language version of the post, itself included. */
export async function getGroupAlternates(post: { postGroupId: string | null; language: string; slug: string }) {
  const alternates: Record<string, string> = { [post.language]: `/${post.language}/blog/${post.slug}` };
  if (!post.postGroupId) return alternates;
  const siblings = await prisma.post.findMany({
    where: { postGroupId: post.postGroupId, ...visiblePostWhere() },
    select: { language: true, slug: true },
  });
  for (const s of siblings) alternates[s.language] = `/${s.language}/blog/${s.slug}`;
  return alternates;
}

export const getCategoryBySlug = (language: string, slug: string) =>
  prisma.blogCategory.findUnique({ where: { language_slug: { language, slug } } });

export const getTagBySlug = (language: string, slug: string) =>
  prisma.blogTag.findUnique({ where: { language_slug: { language, slug } } });
