import Link from 'next/link';
import { PostMeta } from './PostMeta';

export interface PostCardData {
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  coverImageAlt: string | null;
  publishedAt: Date | string | null;
  readingTime: number;
  category: { name: string; slug: string } | null;
  author: { name: string | null } | null;
}

export function PostCard({ post, lang }: { post: PostCardData; lang: string }) {
  const href = `/${lang}/blog/${encodeURIComponent(post.slug)}`;
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
      {post.coverImage && (
        <Link href={href} className="block aspect-[16/9] overflow-hidden bg-neutral-100 dark:bg-neutral-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.coverImage} alt={post.coverImageAlt || post.title} className="h-full w-full object-cover" loading="lazy" />
        </Link>
      )}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <PostMeta lang={lang} date={post.publishedAt} readingTime={post.readingTime} category={post.category} />
        <h2 className="text-xl font-semibold leading-snug">
          <Link href={href} className="hover:text-blue-600">{post.title}</Link>
        </h2>
        {post.excerpt && <p className="text-neutral-600 dark:text-neutral-300 line-clamp-3">{post.excerpt}</p>}
      </div>
    </article>
  );
}
