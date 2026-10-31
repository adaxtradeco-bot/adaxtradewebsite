'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageBuilder } from '@/components/admin/PageBuilder/PageBuilder';
import { loadBuilderPost, saveBuilderPost, BuilderPostData } from '@/lib/blog/builder-api';
import { SectionConfig } from '@/lib/page-builder/section-schemas';

export default function BlogPostBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [post, setPost] = useState<BuilderPostData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBuilderPost(id)
      .then((data) => (data ? setPost(data) : setError('Failed to load post')))
      .catch(() => setError('Failed to load post'))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleSave = async (sections: SectionConfig[]) => {
    if (!post) return;
    if (!(await saveBuilderPost(post.id, sections))) throw new Error('Failed to save post');
  };

  const handleExit = () => router.push(`/admin/blog/posts/${id}`);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading page builder...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Post</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error || 'Post not found'}</p>
          <button onClick={() => router.push('/admin/blog/posts')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            Back to Posts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <div className="fixed top-2 left-2 z-50">
        <button
          onClick={handleExit}
          className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg font-medium transition-colors shadow-sm border border-gray-200 dark:border-gray-600"
        >
          Back to Post
        </button>
      </div>

      <div className="fixed top-2 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 flex items-center space-x-3">
          <span className="text-sm font-medium text-gray-900 dark:text-white">{post.title}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">{post.slug}</span>
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
            {post.status} · {post.language.toUpperCase()}
          </span>
        </div>
      </div>

      <PageBuilder
        pageId={post.id}
        initialSections={post.builderData || []}
        onSave={handleSave}
        pageStatus={post.status}
        publishUrl={`/api/admin/blog/posts/${post.id}`}
        language={post.language}
      />
    </div>
  );
}
