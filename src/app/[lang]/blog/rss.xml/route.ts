import { prisma } from '@/lib/prisma';
import { supportedLanguages } from '@/lib/i18n/config';
import { visiblePostWhere } from '@/lib/blog/visibility';
import { absoluteUrl, siteInfo } from '@/lib/blog/seo';
import { getLabels } from '../_components/labels';

export const revalidate = 60;

const xmlEscape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

export async function GET(_req: Request, { params }: { params: { lang: string } }) {
  const lang = params.lang;
  if (!supportedLanguages.includes(lang)) return new Response('Not found', { status: 404 });

  const { baseUrl, siteName } = await siteInfo();
  const posts = await prisma.post.findMany({
    where: { language: lang, ...visiblePostWhere(), noindex: false },
    include: { category: { select: { name: true } } },
    orderBy: [{ publishedAt: 'desc' }, { scheduledAt: 'desc' }],
    take: 20,
  });

  const blogUrl = absoluteUrl(baseUrl, `/${lang}/blog`);
  const selfUrl = absoluteUrl(baseUrl, `/${lang}/blog/rss.xml`);
  const title = siteName ? `${siteName} - ${getLabels(lang).blog}` : getLabels(lang).blog;
  const dates = posts.map((p) => (p.publishedAt ?? p.scheduledAt ?? p.updatedAt).getTime());
  const lastBuild = new Date(dates.length ? Math.max(...dates) : Date.now()).toUTCString();

  const items = posts
    .map((p) => {
      const link = absoluteUrl(baseUrl, `/${lang}/blog/${p.slug}`);
      const date = (p.publishedAt ?? p.scheduledAt ?? p.updatedAt).toUTCString();
      return [
        '    <item>',
        `      <title>${xmlEscape(p.title)}</title>`,
        `      <link>${xmlEscape(link)}</link>`,
        `      <guid isPermaLink="true">${xmlEscape(link)}</guid>`,
        `      <pubDate>${date}</pubDate>`,
        p.excerpt ? `      <description>${xmlEscape(p.excerpt)}</description>` : '',
        p.category ? `      <category>${xmlEscape(p.category.name)}</category>` : '',
        '    </item>',
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xmlEscape(title)}</title>
    <link>${xmlEscape(blogUrl)}</link>
    <description>${xmlEscape(title)}</description>
    <language>${xmlEscape(lang)}</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="${xmlEscape(selfUrl)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
