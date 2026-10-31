import { prisma } from '@/lib/prisma';

// Built from a string: the tsconfig target predates the `u` regex flag.
const NON_WORD = new RegExp('[^\\p{L}\\p{N}]+', 'gu');
const WORD_BREAKS = /[‌‎‏]/g; // ZWNJ and direction marks

/** Lowercases and joins words with "-", keeping Persian/Arabic letters and digits. */
export function slugify(input: string): string {
  return input
    .normalize('NFKC')
    .toLowerCase()
    .replace(WORD_BREAKS, '-')
    .replace(NON_WORD, '-')
    .replace(/^-+|-+$/g, '');
}

/** First free slug for the language: `base`, `base-2`, `base-3`, … */
export async function uniqueSlug(
  language: string,
  base: string,
  client: Pick<typeof prisma, 'post'> = prisma
): Promise<string> {
  const root = slugify(base) || 'post';
  let candidate = root;
  for (let n = 2; await client.post.findUnique({ where: { language_slug: { language, slug: candidate } }, select: { id: true } }); n++) {
    candidate = `${root}-${n}`;
  }
  return candidate;
}
