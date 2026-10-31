/** Parses a page number from a URL segment/param; null when it is not a positive integer. */
export function parsePageParam(raw: string | string[] | undefined): number | null {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (v === undefined || !/^\d+$/.test(v)) return null;
  const n = Number(v);
  return n >= 1 ? n : null;
}

/** True when the requested page is outside the result set (page 1 is always valid). */
export const isOutOfRange = (page: number, totalPages: number) => page > Math.max(1, totalPages);

/** Canonical href for page `p` of an index-style listing. */
export const indexPageHref = (lang: string, p: number) => (p === 1 ? `/${lang}/blog` : `/${lang}/blog/page/${p}`);
