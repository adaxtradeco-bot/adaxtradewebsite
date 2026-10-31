/** Prisma `where` for posts a visitor may see. Scheduling is evaluated at query time. */
export const visiblePostWhere = (now = new Date()) => ({
  OR: [
    { status: 'published', publishedAt: { lte: now } },
    { status: 'scheduled', scheduledAt: { lte: now } },
  ],
});

/** In-memory twin of `visiblePostWhere`. */
export function isPostVisible(
  post: { status: string; publishedAt?: Date | null; scheduledAt?: Date | null },
  now = new Date()
): boolean {
  if (post.status === 'published') return !!post.publishedAt && post.publishedAt <= now;
  if (post.status === 'scheduled') return !!post.scheduledAt && post.scheduledAt <= now;
  return false;
}
