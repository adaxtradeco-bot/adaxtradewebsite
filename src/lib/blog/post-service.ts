import { prisma } from '@/lib/prisma';
import { sanitizeSections } from './sanitize';
import { readingTime } from './reading-time';
import { slugify, uniqueSlug } from './slug';
import type { PostInput, PostStatus, PostUpdate } from './schemas';

export class BlogServiceError extends Error {
  constructor(
    public code: 'not_found' | 'conflict',
    message: string,
    public status: number
  ) {
    super(message);
  }
}

const notFound = (what = 'Post') => new BlogServiceError('not_found', `${what} not found`, 404);
const conflict = (message: string) => new BlogServiceError('conflict', message, 409);

const postInclude = { category: true, tags: true } as const;

type Source = 'admin' | 'api';
type CreateInput = PostInput & { translationOf?: string };

async function resolveCategoryId(language: string, input: { category?: string | null; categoryId?: string | null }) {
  if (input.categoryId !== undefined) return input.categoryId;
  if (input.category === undefined) return undefined;
  if (input.category === null) return null;
  const slug = slugify(input.category);
  const existing = await prisma.blogCategory.findFirst({
    where: { language, OR: [{ slug }, { name: input.category }] },
    select: { id: true },
  });
  if (existing) return existing.id;
  const created = await prisma.blogCategory.create({ data: { language, name: input.category, slug: slug || 'category' } });
  return created.id;
}

async function resolveTagIds(language: string, names: string[]) {
  const ids: { id: string }[] = [];
  for (const name of names) {
    const slug = slugify(name);
    if (!slug) continue;
    const tag = await prisma.blogTag.upsert({
      where: { language_slug: { language, slug } },
      update: {},
      create: { language, slug, name },
      select: { id: true },
    });
    ids.push(tag);
  }
  return ids;
}

function statusFields(
  status: PostStatus | undefined,
  input: { publishedAt?: Date | null; scheduledAt?: Date | null },
  existing?: { publishedAt: Date | null }
) {
  if (status === 'published') {
    return { status, publishedAt: input.publishedAt ?? existing?.publishedAt ?? new Date(), scheduledAt: null };
  }
  if (status === 'scheduled') return { status, scheduledAt: input.scheduledAt, publishedAt: null };
  return {
    ...(status && { status }),
    ...(input.publishedAt !== undefined && { publishedAt: input.publishedAt }),
    ...(input.scheduledAt !== undefined && { scheduledAt: input.scheduledAt }),
  };
}

const pruneEmptyGroups = (ids: Array<string | null>) =>
  prisma.postGroup.deleteMany({ where: { id: { in: ids.filter((id): id is string => !!id) }, posts: { none: {} } } });

/** Group of `post`, created (and attached) if the post has none yet. */
async function ensureGroup(post: { id: string; language: string; postGroupId: string | null }) {
  if (post.postGroupId) return post.postGroupId;
  const group = await prisma.postGroup.create({ data: { defaultLanguage: post.language } });
  await prisma.post.update({ where: { id: post.id }, data: { postGroupId: group.id } });
  return group.id;
}

async function assertLanguageFree(groupId: string, language: string) {
  const taken = await prisma.post.findFirst({ where: { postGroupId: groupId, language }, select: { id: true } });
  if (taken) throw conflict(`This article already has a "${language}" version`);
}

export async function createPost(input: CreateInput, opts: { source: Source }) {
  const { language } = input;

  if (input.externalId) {
    const existing = await prisma.post.findUnique({
      where: { language_externalId: { language, externalId: input.externalId } },
      include: postInclude,
    });
    if (existing) return { post: existing, created: false };
  }

  if (input.slug && opts.source === 'admin') {
    const taken = await prisma.post.findUnique({ where: { language_slug: { language, slug: input.slug } }, select: { id: true } });
    if (taken) throw conflict('Slug already in use for this language');
  }

  let postGroupId: string | undefined;
  if (input.translationOf) {
    const origin = await prisma.post.findFirst({
      where: { OR: [{ id: input.translationOf }, { externalId: input.translationOf }] },
      select: { id: true, language: true, postGroupId: true },
    });
    if (!origin) throw notFound('translationOf post');
    postGroupId = await ensureGroup(origin);
    await assertLanguageFree(postGroupId, language);
  } else {
    postGroupId = (await prisma.postGroup.create({ data: { defaultLanguage: language } })).id;
  }

  const sections = sanitizeSections(input.sections ?? []);
  const slug = await uniqueSlug(language, input.slug ?? input.title);
  const categoryId = await resolveCategoryId(language, input);
  const tags = input.tags ? await resolveTagIds(language, input.tags) : [];

  const post = await prisma.post.create({
    data: {
      language,
      slug,
      title: input.title,
      excerpt: input.excerpt,
      coverImage: input.coverImage,
      coverImageAlt: input.coverImageAlt,
      builderData: JSON.stringify(sections),
      readingTime: readingTime(sections, language),
      metaTitle: input.metaTitle,
      metaDescription: input.metaDescription,
      ogImage: input.ogImage,
      canonicalUrl: input.canonicalUrl,
      noindex: input.noindex ?? false,
      source: opts.source,
      externalId: input.externalId,
      authorId: input.authorId,
      categoryId,
      postGroupId,
      tags: { connect: tags },
      ...statusFields(input.status ?? 'draft', input),
    },
    include: postInclude,
  });
  return { post, created: true };
}

export async function updatePost(id: string, patch: PostUpdate) {
  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) throw notFound();

  if (patch.slug && patch.slug !== existing.slug) {
    const taken = await prisma.post.findUnique({
      where: { language_slug: { language: existing.language, slug: patch.slug } },
      select: { id: true },
    });
    if (taken) throw conflict('Slug already in use for this language');
  }

  const sections = patch.sections ? sanitizeSections(patch.sections) : undefined;
  const categoryId = await resolveCategoryId(existing.language, patch);
  const tags = patch.tags ? await resolveTagIds(existing.language, patch.tags) : undefined;

  return prisma.post.update({
    where: { id },
    data: {
      slug: patch.slug,
      title: patch.title,
      excerpt: patch.excerpt,
      coverImage: patch.coverImage,
      coverImageAlt: patch.coverImageAlt,
      metaTitle: patch.metaTitle,
      metaDescription: patch.metaDescription,
      ogImage: patch.ogImage,
      canonicalUrl: patch.canonicalUrl,
      noindex: patch.noindex,
      externalId: patch.externalId,
      authorId: patch.authorId,
      categoryId,
      ...(sections && {
        builderData: JSON.stringify(sections),
        readingTime: readingTime(sections, existing.language),
      }),
      ...(tags && { tags: { set: tags } }),
      ...statusFields(patch.status, patch, existing),
    },
    include: postInclude,
  });
}

export async function deletePost(id: string) {
  const post = await prisma.post.findUnique({ where: { id }, select: { postGroupId: true } });
  if (!post) throw notFound();
  await prisma.post.delete({ where: { id } });
  await pruneEmptyGroups([post.postGroupId]);
}

export async function bulkDelete(ids: string[]) {
  const posts = await prisma.post.findMany({ where: { id: { in: ids } }, select: { postGroupId: true } });
  const { count } = await prisma.post.deleteMany({ where: { id: { in: ids } } });
  await pruneEmptyGroups(posts.map((p) => p.postGroupId));
  return count;
}

export async function bulkUpdateStatus(ids: string[], status: 'draft' | 'published' | 'archived') {
  const { count } = await prisma.post.updateMany({ where: { id: { in: ids } }, data: { status, scheduledAt: null } });
  if (status === 'published') {
    await prisma.post.updateMany({ where: { id: { in: ids }, publishedAt: null }, data: { publishedAt: new Date() } });
  }
  return count;
}

/** New draft in `language`, same group, copying body and cover; text is left for translation. */
export async function addTranslation(id: string, language: string) {
  const origin = await prisma.post.findUnique({ where: { id }, include: { category: true } });
  if (!origin) throw notFound();

  const postGroupId = await ensureGroup(origin);
  await assertLanguageFree(postGroupId, language);

  const linkedCategory = origin.category?.groupKey
    ? await prisma.blogCategory.findFirst({ where: { language, groupKey: origin.category.groupKey }, select: { id: true } })
    : null;

  return prisma.post.create({
    data: {
      language,
      slug: await uniqueSlug(language, origin.title),
      title: origin.title,
      builderData: origin.builderData,
      readingTime: origin.readingTime,
      coverImage: origin.coverImage,
      coverImageAlt: origin.coverImageAlt,
      authorId: origin.authorId,
      categoryId: linkedCategory?.id,
      postGroupId,
      status: 'draft',
      source: 'admin',
    },
    include: postInclude,
  });
}
