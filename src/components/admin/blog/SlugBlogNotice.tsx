'use client';

/** True when a page slug would collide with the blog index route (/{lang}/blog). */
export function isBlogIndexSlug(slug: string, language: string): boolean {
  const clean = (slug || '').replace(/^\/+|\/+$/g, '').toLowerCase();
  return clean === 'blog' || clean === `${language}/blog`;
}

/** Yellow inline notice for the builder-page form. */
export function SlugBlogNotice({ slug, language }: { slug: string; language: string }) {
  if (!isBlogIndexSlug(slug, language)) return null;
  return (
    <p
      role="alert"
      className="mt-2 text-sm px-3 py-2 rounded-lg bg-yellow-50 text-yellow-800 border border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800"
    >
      This slug is reserved for the blog index (/{language}/blog). The blog route takes precedence over this page.
    </p>
  );
}
