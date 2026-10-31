import { z } from 'zod';
import { BaseSectionSchema } from '@/lib/page-builder/section-schemas';

export const POST_STATUSES = ['draft', 'scheduled', 'published', 'archived'] as const;
export type PostStatus = (typeof POST_STATUSES)[number];

const isoDate = z
  .string()
  .datetime({ offset: true })
  .transform((s) => new Date(s));

export const ContentBlockSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('heading'), text: z.string().min(1), level: z.union([z.literal(2), z.literal(3), z.literal(4)]).default(2) }),
  z.object({ type: z.literal('paragraph'), html: z.string().min(1) }),
  z.object({ type: z.literal('html'), html: z.string().min(1) }),
  z.object({ type: z.literal('image'), src: z.string().url(), alt: z.string().default(''), caption: z.string().optional() }),
  z.object({ type: z.literal('list'), ordered: z.boolean().default(false), items: z.array(z.string().min(1)).min(1) }),
  z.object({ type: z.literal('quote'), text: z.string().min(1), cite: z.string().optional() }),
]);
export type ContentBlock = z.infer<typeof ContentBlockSchema>;

/** Fields shared by the admin form and the external API. */
const postFields = {
  title: z.string().min(1).max(300),
  slug: z.string().min(1).max(200).optional(),
  excerpt: z.string().max(1000).nullish(),
  coverImageAlt: z.string().max(300).nullish(),
  status: z.enum(POST_STATUSES).optional(),
  publishedAt: isoDate.nullish(),
  scheduledAt: isoDate.nullish(),
  tags: z.array(z.string().min(1).max(80)).max(30).optional(),
  externalId: z.string().min(1).max(200).optional(),
};

const needsScheduleDate = (v: { status?: string; scheduledAt?: Date | null }) =>
  v.status !== 'scheduled' || !!v.scheduledAt;
const scheduleIssue = { message: 'scheduledAt is required when status is "scheduled"', path: ['scheduledAt'] };

/** Admin write model (create). Update uses `PostUpdateSchema`. */
const postInputObject = z.object({
    ...postFields,
    language: z.string().min(2).max(10),
    coverImage: z.string().nullish(),
    sections: z.array(BaseSectionSchema).optional(),
    category: z.string().nullish(), // slug or name; created if missing
    categoryId: z.string().nullish(),
    authorId: z.string().nullish(),
    metaTitle: z.string().max(300).nullish(),
    metaDescription: z.string().max(500).nullish(),
    ogImage: z.string().nullish(),
    canonicalUrl: z.string().url().nullish(),
    noindex: z.boolean().optional(),
  });

export const PostInputSchema = postInputObject.refine(needsScheduleDate, scheduleIssue);
export type PostInput = z.infer<typeof PostInputSchema>;

export const PostUpdateSchema = postInputObject
  .partial()
  .omit({ language: true })
  .refine(needsScheduleDate, scheduleIssue);
export type PostUpdate = z.infer<typeof PostUpdateSchema>;

const seoFields = z
  .object({
    metaTitle: z.string().max(300).optional(),
    metaDescription: z.string().max(500).optional(),
    ogImage: z.string().url().optional(),
    noindex: z.boolean().optional(),
  })
  .optional();

const apiBodyFields = {
  ...postFields,
  coverImageUrl: z.string().url().optional(),
  category: z.string().min(1).max(120).optional(),
  seo: seoFields,
  sections: z.array(BaseSectionSchema).optional(),
  html: z.string().min(1).optional(),
  content: z.array(ContentBlockSchema).min(1).optional(),
};

const exactlyOneBody = (v: { sections?: unknown; html?: unknown; content?: unknown }) =>
  [v.sections, v.html, v.content].filter((x) => x !== undefined).length === 1;
const bodyIssue = { message: 'Provide exactly one of sections, html or content', path: ['sections'] };

export const ApiCreatePostSchema = z
  .object({
    ...apiBodyFields,
    language: z.string().min(2).max(10),
    translationOf: z.string().min(1).optional(), // post id or externalId
    authorEmail: z.string().email().optional(),
  })
  .refine(exactlyOneBody, bodyIssue)
  .refine(needsScheduleDate, scheduleIssue);
export type ApiCreatePost = z.infer<typeof ApiCreatePostSchema>;

export const ApiUpdatePostSchema = z
  .object(apiBodyFields)
  .partial()
  .refine((v) => [v.sections, v.html, v.content].filter((x) => x !== undefined).length <= 1, bodyIssue)
  .refine(needsScheduleDate, scheduleIssue);
export type ApiUpdatePost = z.infer<typeof ApiUpdatePostSchema>;

export const CategoryInputSchema = z.object({
  name: z.string().min(1).max(120),
  slug: z.string().min(1).max(120).optional(),
  description: z.string().max(1000).nullish(),
  language: z.string().min(2).max(10),
  groupKey: z.string().max(120).nullish(), // same value across languages = same category
});

export const TagInputSchema = z.object({
  name: z.string().min(1).max(80),
  slug: z.string().min(1).max(80).optional(),
  language: z.string().min(2).max(10),
});
