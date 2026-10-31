import { describe, it, expect } from 'vitest';
import { isPostVisible, visiblePostWhere } from '@/lib/blog/visibility';

const now = new Date('2026-06-01T12:00:00Z');
const past = new Date('2026-05-01T00:00:00Z');
const future = new Date('2026-07-01T00:00:00Z');

describe('isPostVisible', () => {
  it('shows published posts whose publishedAt has passed', () => {
    expect(isPostVisible({ status: 'published', publishedAt: past }, now)).toBe(true);
    expect(isPostVisible({ status: 'published', publishedAt: future }, now)).toBe(false);
    expect(isPostVisible({ status: 'published', publishedAt: null }, now)).toBe(false);
  });

  it('shows scheduled posts only once scheduledAt has passed', () => {
    expect(isPostVisible({ status: 'scheduled', scheduledAt: past }, now)).toBe(true);
    expect(isPostVisible({ status: 'scheduled', scheduledAt: future }, now)).toBe(false);
  });

  it('hides drafts and archived posts', () => {
    expect(isPostVisible({ status: 'draft', publishedAt: past }, now)).toBe(false);
    expect(isPostVisible({ status: 'archived', publishedAt: past }, now)).toBe(false);
  });
});

describe('visiblePostWhere', () => {
  it('builds the same rule for Prisma', () => {
    expect(visiblePostWhere(now).OR).toEqual([
      { status: 'published', publishedAt: { lte: now } },
      { status: 'scheduled', scheduledAt: { lte: now } },
    ]);
  });
});
