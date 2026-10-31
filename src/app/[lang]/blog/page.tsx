import type { Metadata } from 'next';
import { absoluteUrl, blogIndexAlternates, breadcrumbJsonLd, buildListMetadata, listJsonLd, postPath, siteInfo } from '@/lib/blog/seo';
import { JsonLd } from './_components/JsonLd';
import { listPosts } from '@/lib/blog/queries';
import { BlogLayout } from './_components/BlogLayout';
import { PostList } from './_components/PostList';
import { getLabels } from './_components/labels';
import { indexPageHref } from './_components/pagination-math';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const { baseUrl } = await siteInfo();
  return buildListMetadata({
    language: params.lang,
    title: getLabels(params.lang).blog,
    path: `/${params.lang}/blog`,
    alternates: blogIndexAlternates(),
    baseUrl,
  });
}

export default async function BlogIndexPage({ params }: { params: { lang: string } }) {
  const { lang } = params;
  const { posts, page, totalPages } = await listPosts({ language: lang, page: 1 });
  const { baseUrl } = await siteInfo();
  const name = getLabels(lang).blog;
  const url = absoluteUrl(baseUrl, `/${lang}/blog`);
  return (
    <BlogLayout lang={lang} wide>
      <JsonLd data={breadcrumbJsonLd([{ name, url }])} />
      <JsonLd data={listJsonLd({ name, url, language: lang, type: 'Blog', postUrls: posts.map((p) => absoluteUrl(baseUrl, postPath(p))) })} />
      <h1 className="mb-8 text-3xl font-bold">{getLabels(lang).blog}</h1>
      <PostList lang={lang} posts={posts} page={page} totalPages={totalPages} hrefFor={(p) => indexPageHref(lang, p)} />
    </BlogLayout>
  );
}
