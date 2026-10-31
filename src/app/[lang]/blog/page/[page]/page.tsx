import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { absoluteUrl, blogIndexAlternates, breadcrumbJsonLd, buildListMetadata, listJsonLd, postPath, siteInfo } from '@/lib/blog/seo';
import { JsonLd } from '../../_components/JsonLd';
import { listPosts } from '@/lib/blog/queries';
import { BlogLayout } from '../../_components/BlogLayout';
import { PostList } from '../../_components/PostList';
import { getLabels } from '../../_components/labels';
import { indexPageHref, isOutOfRange, parsePageParam } from '../../_components/pagination-math';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { lang: string; page: string } }): Promise<Metadata> {
  const n = parsePageParam(params.page);
  if (n === null) return {};
  const { baseUrl } = await siteInfo();
  return buildListMetadata({
    language: params.lang,
    title: getLabels(params.lang).blog,
    path: indexPageHref(params.lang, n),
    page: n,
    alternates: blogIndexAlternates(),
    baseUrl,
  });
}

export default async function BlogPagedPage({ params }: { params: { lang: string; page: string } }) {
  const { lang } = params;
  const n = parsePageParam(params.page);
  if (n === null) notFound();
  if (n === 1) redirect(`/${lang}/blog`);
  const { posts, page, totalPages } = await listPosts({ language: lang, page: n });
  if (isOutOfRange(n, totalPages)) notFound();
  const { baseUrl } = await siteInfo();
  const name = getLabels(lang).blog;
  const pageUrl = absoluteUrl(baseUrl, indexPageHref(lang, n));
  return (
    <BlogLayout lang={lang} wide>
      <JsonLd data={breadcrumbJsonLd([{ name, url: absoluteUrl(baseUrl, `/${lang}/blog`) }, { name: `${name} (${n})`, url: pageUrl }])} />
      <JsonLd data={listJsonLd({ name, url: pageUrl, language: lang, postUrls: posts.map((p) => absoluteUrl(baseUrl, postPath(p))) })} />
      <h1 className="mb-8 text-3xl font-bold">{getLabels(lang).blog}</h1>
      <PostList lang={lang} posts={posts} page={page} totalPages={totalPages} hrefFor={(p) => indexPageHref(lang, p)} />
    </BlogLayout>
  );
}
