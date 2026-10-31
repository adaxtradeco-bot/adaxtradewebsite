import type { Metadata } from 'next';
import { absoluteUrl, breadcrumbJsonLd, buildListMetadata, listJsonLd, postPath, siteInfo } from '@/lib/blog/seo';
import { JsonLd } from '../../_components/JsonLd';
import { getLabels } from '../../_components/labels';
import { notFound } from 'next/navigation';
import { getCategoryBySlug, listPosts } from '@/lib/blog/queries';
import { BlogLayout } from '../../_components/BlogLayout';
import { PostList } from '../../_components/PostList';
import { isOutOfRange, parsePageParam } from '../../_components/pagination-math';

export const revalidate = 60;

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { lang: string; slug: string };
  searchParams: { page?: string | string[] };
}): Promise<Metadata> {
  let slug = params.slug;
  try {
    slug = decodeURIComponent(slug);
  } catch {
    return {};
  }
  const category = await getCategoryBySlug(params.lang, slug);
  if (!category) return {};
  const n = searchParams.page === undefined ? 1 : parsePageParam(searchParams.page);
  if (n === null) return {};
  const base = `/${params.lang}/blog/category/${encodeURIComponent(slug)}`;
  const { baseUrl } = await siteInfo();
  return buildListMetadata({
    language: params.lang,
    title: category.name,
    path: n === 1 ? base : `${base}?page=${n}`,
    page: n,
    baseUrl,
  });
}

export default async function BlogCategoryPage({
  params,
  searchParams,
}: {
  params: { lang: string; slug: string };
  searchParams: { page?: string | string[] };
}) {
  const { lang } = params;
  let slug = params.slug;
  try {
    slug = decodeURIComponent(slug);
  } catch {
    notFound();
  }
  const category = await getCategoryBySlug(lang, slug);
  if (!category) notFound();

  const n = searchParams.page === undefined ? 1 : parsePageParam(searchParams.page);
  if (n === null) notFound();
  const { posts, page, totalPages } = await listPosts({ language: lang, page: n, categorySlug: slug });
  if (isOutOfRange(n, totalPages)) notFound();

  const base = `/${lang}/blog/category/${encodeURIComponent(slug)}`;
  const { baseUrl } = await siteInfo();
  const pageUrl = absoluteUrl(baseUrl, page === 1 ? base : `${base}?page=${page}`);
  const name = category.name;
  return (
    <BlogLayout lang={lang} wide>
      <JsonLd data={breadcrumbJsonLd([
        { name: getLabels(lang).blog, url: absoluteUrl(baseUrl, `/${lang}/blog`) },
        { name, url: absoluteUrl(baseUrl, base) },
      ])} />
      <JsonLd data={listJsonLd({ name, url: pageUrl, language: lang, postUrls: posts.map((p) => absoluteUrl(baseUrl, postPath(p))) })} />
      <h1 className="mb-8 text-3xl font-bold">{category.name}</h1>
      <PostList lang={lang} posts={posts} page={page} totalPages={totalPages} hrefFor={(p) => (p === 1 ? base : `${base}?page=${p}`)} />
    </BlogLayout>
  );
}
