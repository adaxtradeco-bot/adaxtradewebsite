import Link from 'next/link';
import { getLabels } from './labels';

export function formatPostDate(date: Date | string | null | undefined, lang: string): string {
  if (!date) return '';
  const d = new Date(date);
  try {
    return d.toLocaleDateString(lang, { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return d.toISOString().slice(0, 10);
  }
}

interface PostMetaProps {
  lang: string;
  date?: Date | string | null;
  readingTime?: number;
  authorName?: string | null;
  category?: { name: string; slug: string } | null;
}

export function PostMeta({ lang, date, readingTime, authorName, category }: PostMetaProps) {
  const t = getLabels(lang);
  const items: React.ReactNode[] = [];
  if (category) {
    items.push(
      <Link key="cat" href={`/${lang}/blog/category/${encodeURIComponent(category.slug)}`} className="text-blue-600 hover:underline">
        {category.name}
      </Link>
    );
  }
  if (date) items.push(<time key="date" dateTime={new Date(date).toISOString()}>{formatPostDate(date, lang)}</time>);
  if (readingTime) items.push(<span key="rt">{readingTime} {t.minRead}</span>);
  if (authorName) items.push(<span key="by">{t.by} {authorName}</span>);
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-500 dark:text-neutral-400">{items}</div>
  );
}
