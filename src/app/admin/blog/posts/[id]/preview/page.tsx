'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { blogApi } from '@/lib/admin/api';
import { PageRenderer } from '@/components/admin/PageBuilder/PageRenderer';
import type { SectionConfig } from '@/lib/page-builder/section-schemas';

// Admin-only: data comes from the authenticated admin API, so drafts are never public.
export default function BlogPostPreview() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    blogApi.posts.get(id).then((d) => setPost(d.post)).catch((e) => setError(e instanceof Error ? e.message : 'Failed to load post'));
  }, [id]);

  if (error) return <p className="p-6 text-red-600">{error}</p>;
  if (!post) return <p className="p-6 text-gray-500">Loading...</p>;

  let sections: SectionConfig[] = [];
  try {
    const parsed = post.builderData ? JSON.parse(post.builderData) : [];
    if (Array.isArray(parsed)) sections = parsed;
  } catch {
    sections = [];
  }

  return (
    <div>
      <div className="flex items-center justify-between px-4 py-2 bg-yellow-100 text-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-200">
        <span className="font-medium">Preview — not public ({post.status})</span>
        <Link href={`/admin/blog/posts/${post.id}`} className="underline">Back to editor</Link>
      </div>
      <article dir={post.language === 'fa' || post.language === 'ar' ? 'rtl' : 'ltr'} className="blog-post">
        <header className="max-w-3xl mx-auto px-4 pt-8">
          <h1 className="text-4xl font-bold">{post.title}</h1>
          {post.excerpt && <p className="mt-3 text-lg opacity-80">{post.excerpt}</p>}
          {post.coverImage && <img src={post.coverImage} alt={post.coverImageAlt ?? ''} className="mt-6 w-full rounded-lg" />}
        </header>
        <PageRenderer sections={sections} isPreview />
      </article>
    </div>
  );
}
