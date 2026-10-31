'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { blogApi, BlogPostListItem, BlogTerm } from '@/lib/admin/api';
import Toast from '@/components/ui/Toast';
import { BLOG_LANGUAGES, POST_STATUS_OPTIONS, STATUS_BADGE, inputClass, useCanDelete } from '@/components/admin/blog/shared';

type BulkAction = 'publish' | 'draft' | 'archive' | 'delete';

export default function AdminBlogPosts() {
  const canDelete = useCanDelete();
  const [posts, setPosts] = useState<BlogPostListItem[]>([]);
  const [categories, setCategories] = useState<BlogTerm[]>([]);
  const [authors, setAuthors] = useState<Record<string, string>>({});
  const [filters, setFilters] = useState({ language: '', status: '', categoryId: '', authorId: '', q: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await blogApi.posts.list({ ...filters, page });
      setPosts(data.posts);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setSelected([]);
      setAuthors((prev) => {
        const next = { ...prev };
        data.posts.forEach((p) => p.author && (next[p.author.id] = p.author.name));
        return next;
      });
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : 'Failed to load posts', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    blogApi.categories.list().then((d) => setCategories(d.categories)).catch(() => {});
  }, []);

  const setFilter = (key: keyof typeof filters, value: string) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };

  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const runBulk = async (action: BulkAction) => {
    if (action === 'delete' && !window.confirm(`Delete ${selected.length} post(s)? This cannot be undone.`)) return;
    try {
      const res = await blogApi.posts.bulk(selected, action);
      setToast({ message: `${res.count} post(s) updated`, type: 'success' });
      await load();
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : 'Bulk action failed', type: 'error' });
    }
  };

  const removeOne = async (post: BlogPostListItem) => {
    if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    try {
      await blogApi.posts.remove(post.id);
      setToast({ message: 'Post deleted', type: 'success' });
      await load();
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : 'Delete failed', type: 'error' });
    }
  };

  const fmt = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString() : '—');

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Blog Posts</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Manage blog posts and their translations</p>
        </div>
        <Link href="/admin/blog/posts/new" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          + New Post
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
        <input
          type="search"
          aria-label="Search title"
          placeholder="Search title..."
          value={filters.q}
          onChange={(e) => setFilter('q', e.target.value)}
          className={inputClass}
        />
        <select aria-label="Language" value={filters.language} onChange={(e) => setFilter('language', e.target.value)} className={inputClass}>
          <option value="">All languages</option>
          {BLOG_LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>{l.name}</option>
          ))}
        </select>
        <select aria-label="Status" value={filters.status} onChange={(e) => setFilter('status', e.target.value)} className={inputClass}>
          <option value="">All statuses</option>
          {POST_STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select aria-label="Category" value={filters.categoryId} onChange={(e) => setFilter('categoryId', e.target.value)} className={inputClass}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name} ({c.language})</option>
          ))}
        </select>
        <select aria-label="Author" value={filters.authorId} onChange={(e) => setFilter('authorId', e.target.value)} className={inputClass}>
          <option value="">All authors</option>
          {Object.entries(authors).map(([id, name]) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </select>
      </div>

      {selected.length > 0 && (
        <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
          <span className="text-sm text-gray-700 dark:text-gray-300">{selected.length} selected</span>
          <button onClick={() => runBulk('publish')} className="px-3 py-1 text-sm rounded bg-green-600 text-white">Publish</button>
          <button onClick={() => runBulk('draft')} className="px-3 py-1 text-sm rounded bg-yellow-600 text-white">Draft</button>
          <button onClick={() => runBulk('archive')} className="px-3 py-1 text-sm rounded bg-gray-600 text-white">Archive</button>
          {canDelete && (
            <button onClick={() => runBulk('delete')} className="px-3 py-1 text-sm rounded bg-red-600 text-white">Delete</button>
          )}
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-slate-700">
            <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
              <th className="px-4 py-3 w-8">
                <input
                  type="checkbox"
                  aria-label="Select all"
                  checked={posts.length > 0 && selected.length === posts.length}
                  onChange={(e) => setSelected(e.target.checked ? posts.map((p) => p.id) : [])}
                />
              </th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Language</th>
              <th className="px-4 py-3">Publish date</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading && (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-gray-500">Loading...</td></tr>
            )}
            {!loading && posts.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-gray-500">No posts found</td></tr>
            )}
            {!loading && posts.map((post) => (
              <tr key={post.id}>
                <td className="px-4 py-3">
                  <input type="checkbox" aria-label={`Select ${post.title}`} checked={selected.includes(post.id)} onChange={() => toggle(post.id)} />
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{post.title}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">/{post.language}/blog/{post.slug}</div>
                </td>
                <td className="px-4 py-3">
                  <span data-testid="status-badge" className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_BADGE[post.status] ?? STATUS_BADGE.draft}`}>
                    {post.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{post.language.toUpperCase()}</td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{fmt(post.publishedAt ?? post.scheduledAt)}</td>
                <td className="px-4 py-3">
                  <span
                    data-testid="source-badge"
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      post.source === 'api'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {post.source}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-sm space-x-3 whitespace-nowrap">
                  <Link href={`/admin/blog/posts/${post.id}`} className="text-indigo-600 dark:text-indigo-400">Edit</Link>
                  <Link href={`/admin/blog/posts/${post.id}/builder`} className="text-blue-600 dark:text-blue-400">Builder</Link>
                  {canDelete && (
                    <button onClick={() => removeOne(post)} className="text-red-600 dark:text-red-400">Delete</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4 text-sm text-gray-600 dark:text-gray-400">
        <span>{total} post(s)</span>
        <div className="flex items-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50">Previous</button>
          <span>Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50">Next</button>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
