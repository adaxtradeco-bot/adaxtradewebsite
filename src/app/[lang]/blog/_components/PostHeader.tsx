import { PostMeta } from './PostMeta';

interface PostHeaderProps {
  lang: string;
  title: string;
  coverImage?: string | null;
  coverImageAlt?: string | null;
  publishedAt?: Date | string | null;
  readingTime: number;
  category?: { name: string; slug: string } | null;
  author?: { name: string | null; avatar: string | null } | null;
}

export function PostHeader({ lang, title, coverImage, coverImageAlt, publishedAt, readingTime, category, author }: PostHeaderProps) {
  return (
    <header className="mb-8">
      {coverImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={coverImage} alt={coverImageAlt || title} className="mb-6 w-full rounded-xl object-cover" />
      )}
      <h1 className="mb-4 text-3xl font-bold leading-tight sm:text-4xl">{title}</h1>
      <PostMeta lang={lang} date={publishedAt} readingTime={readingTime} category={category} />
      {author?.name && (
        <div className="mt-4 flex items-center gap-3">
          {author.avatar && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={author.avatar} alt={author.name} className="h-10 w-10 rounded-full object-cover" />
          )}
          <span className="text-sm font-medium">{author.name}</span>
        </div>
      )}
    </header>
  );
}
