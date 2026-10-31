import { jsonLdString } from '@/lib/blog/seo';

/** Renders structured data; `<` is escaped so content cannot close the script tag. */
export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(data) }} />;
}
