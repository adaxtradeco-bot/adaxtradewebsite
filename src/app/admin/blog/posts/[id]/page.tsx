'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { blogApi } from '@/lib/admin/api';
import { PostForm } from '@/components/admin/blog/PostForm';

export default function EditBlogPost() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setPost(null);
    blogApi.posts.get(id).then((d) => setPost(d.post)).catch((e) => setError(e instanceof Error ? e.message : 'Failed to load post'));
  }, [id]);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!post) return <p className="text-gray-500">Loading...</p>;
  // key remounts the form when switching between translations
  return <PostForm key={post.id} post={post} />;
}
