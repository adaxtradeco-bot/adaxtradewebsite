import Link from 'next/link';
import { getLabels } from './labels';

/** Plain links, no JS. `hrefFor(1)` should return the canonical first-page URL. */
export function Pagination({
  lang,
  page,
  totalPages,
  hrefFor,
}: {
  lang: string;
  page: number;
  totalPages: number;
  hrefFor: (page: number) => string;
}) {
  if (totalPages <= 1) return null;
  const t = getLabels(lang);
  const cls = 'rounded-lg border border-neutral-200 dark:border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800';
  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-between gap-4">
      {page > 1 ? <Link href={hrefFor(page - 1)} rel="prev" className={cls}>{t.prev}</Link> : <span />}
      <span className="text-sm text-neutral-500">{page} / {totalPages}</span>
      {page < totalPages ? <Link href={hrefFor(page + 1)} rel="next" className={cls}>{t.next}</Link> : <span />}
    </nav>
  );
}
