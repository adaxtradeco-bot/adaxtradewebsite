import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getGroupAlternates, getPostBySlug, getRelatedPosts } from '@/lib/blog/queries';
import type { Metadata } from 'next';
import { absoluteUrl, breadcrumbJsonLd, buildPostMetadata, postJsonLd, postPath, siteInfo } from '@/lib/blog/seo';
import { JsonLd } from '../_components/JsonLd';
import type { SectionConfig } from '@/lib/page-builder/section-schemas';
import { BlogLayout } from '../_components/BlogLayout';
import { PostHeader } from '../_components/PostHeader';
import { PostBody } from '../_components/PostBody';
import { PostCard } from '../_components/PostCard';
import { getLabels } from '../_components/labels';

export const revalidate = 60;

function parseSections(raw: string | null): SectionConfig[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: { lang: string; slug: string } }): Promise<Metadata> {
  let slug = params.slug;
  try {
    slug = decodeURIComponent(slug);
  } catch {
    return {};
  }
  const post = await getPostBySlug(params.lang, slug);
  if (!post) return {};
  const [alternates, { baseUrl }] = await Promise.all([getGroupAlternates(post), siteInfo()]);
  return buildPostMetadata(post, alternates, baseUrl);
}

export default async function BlogPostPage({ params }: { params: { lang: string; slug: string } }) {
  const { lang } = params;
  let slug = params.slug;
  try {
    slug = decodeURIComponent(slug);
  } catch {
    notFound();
  }
  const post = await getPostBySlug(lang, slug);
  if (!post) notFound();

  const [related, alternates] = await Promise.all([getRelatedPosts(post), getGroupAlternates(post)]);
  const t = getLabels(lang);
  const { baseUrl, siteName } = await siteInfo();
  const url = absoluteUrl(baseUrl, postPath(post));
  const crumbs = [
    { name: t.blog, url: absoluteUrl(baseUrl, `/${lang}/blog`) },
    ...(post.category ? [{ name: post.category.name, url: absoluteUrl(baseUrl, `/${lang}/blog/category/${post.category.slug}`) }] : []),
    { name: post.title, url },
  ];

  return (
    <BlogLayout lang={lang} alternates={alternates}>
      <JsonLd data={postJsonLd(post, url, { baseUrl, siteName })} />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <article>
        <PostHeader
          lang={lang}
          title={post.title}
          coverImage={post.coverImage}
          coverImageAlt={post.coverImageAlt}
          publishedAt={post.publishedAt ?? post.scheduledAt}
          readingTime={post.readingTime}
          category={post.category}
          author={post.author}
        />
        <PostBody sections={parseSections(post.builderData)} />
        {post.tags.length > 0 && (
          <footer className="mt-10 flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">{t.tags}:</span>
            {post.tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/${lang}/blog/tag/${encodeURIComponent(tag.slug)}`}
                className="rounded-full bg-neutral-100 dark:bg-neutral-800 px-3 py-1 text-sm hover:bg-neutral-200 dark:hover:bg-neutral-700"
              >
                {tag.name}
              </Link>
            ))}
          </footer>
        )}
      </article>
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-semibold">{t.related}</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {related.map((p) => <PostCard key={p.id} post={p} lang={lang} />)}
          </div>
        </section>
      )}
    </BlogLayout>
  );
}
