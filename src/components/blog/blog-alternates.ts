/**
 * Blog language-switch support. The navbar (and its language switcher) lives in the
 * [lang] layout, outside the page tree, so a React context from a page cannot reach it.
 * A tiny external store bridges them: the post page registers its alternates, the
 * switcher reads them.
 */

export type BlogAlternates = Record<string, string>;

let current: BlogAlternates | null = null;
const listeners = new Set<() => void>();

export function setBlogAlternates(value: BlogAlternates | null) {
  current = value;
  listeners.forEach((l) => l());
}
export const getBlogAlternates = () => current;
export function subscribeBlogAlternates(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** True for /{lang}/blog and anything below it. */
export const isBlogPath = (pathname: string) => /^\/[^/]+\/blog(\/|$)/.test(pathname);

/**
 * Target URL when switching to `targetLang` from a blog route: the sibling post when the
 * current post has one, otherwise that language's blog index.
 */
export function resolveBlogSwitchTarget(targetLang: string, alternates: BlogAlternates | null): string {
  return alternates?.[targetLang] ?? `/${targetLang}/blog`;
}
