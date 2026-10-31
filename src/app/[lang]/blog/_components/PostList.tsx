import { PostCard, PostCardData } from './PostCard';
import { Pagination } from './Pagination';
import { getLabels } from './labels';

export function PostList({
  lang,
  posts,
  page,
  totalPages,
  hrefFor,
}: {
  lang: string;
  posts: PostCardData[];
  page: number;
  totalPages: number;
  hrefFor: (page: number) => string;
}) {
  if (posts.length === 0) return <p className="text-neutral-500">{getLabels(lang).empty}</p>;
  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => <PostCard key={p.slug} post={p} lang={lang} />)}
      </div>
      <Pagination lang={lang} page={page} totalPages={totalPages} hrefFor={hrefFor} />
    </>
  );
}
