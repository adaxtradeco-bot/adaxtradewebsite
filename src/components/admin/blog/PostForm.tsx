'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { blogApi, BlogTerm } from '@/lib/admin/api';
import { slugify } from '@/lib/blog/slug';
import { MediaBrowser } from '@/components/admin/PageBuilder/MediaBrowser';
import { BLOG_LANGUAGES, POST_STATUS_OPTIONS, inputClass, isoToLocal, localToIso } from './shared';

interface PostFormProps {
  /** Post as returned by `blogApi.posts.get`; omit to create a new post. */
  post?: any;
}

const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2';

export function PostForm({ post }: PostFormProps) {
  const router = useRouter();
  const isNew = !post;
  const [title, setTitle] = useState<string>(post?.title ?? '');
  const [slug, setSlug] = useState<string>(post?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(!isNew); // auto-generate only until edited
  const [language, setLanguage] = useState<string>(post?.language ?? 'en');
  const [excerpt, setExcerpt] = useState<string>(post?.excerpt ?? '');
  const [coverImage, setCoverImage] = useState<string>(post?.coverImage ?? '');
  const [coverImageAlt, setCoverImageAlt] = useState<string>(post?.coverImageAlt ?? '');
  const [categoryId, setCategoryId] = useState<string>(post?.categoryId ?? '');
  const [tags, setTags] = useState<string[]>((post?.tags ?? []).map((t: { name: string }) => t.name));
  const [tagInput, setTagInput] = useState('');
  const [status, setStatus] = useState<string>(post?.status ?? 'draft');
  const [publishedAt, setPublishedAt] = useState(isoToLocal(post?.publishedAt));
  const [scheduledAt, setScheduledAt] = useState(isoToLocal(post?.scheduledAt));
  const [metaTitle, setMetaTitle] = useState<string>(post?.metaTitle ?? '');
  const [metaDescription, setMetaDescription] = useState<string>(post?.metaDescription ?? '');
  const [ogImage, setOgImage] = useState<string>(post?.ogImage ?? '');
  const [canonicalUrl, setCanonicalUrl] = useState<string>(post?.canonicalUrl ?? '');
  const [noindex, setNoindex] = useState<boolean>(post?.noindex ?? false);

  const [categories, setCategories] = useState<BlogTerm[]>([]);
  const [tagSuggestions, setTagSuggestions] = useState<BlogTerm[]>([]);
  const [mediaTarget, setMediaTarget] = useState<'cover' | 'og' | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showTranslate, setShowTranslate] = useState(false);
  const [newLanguage, setNewLanguage] = useState('');

  useEffect(() => {
    blogApi.categories.list(language).then((d) => setCategories(d.categories)).catch(() => {});
    blogApi.tags.list(language).then((d) => setTagSuggestions(d.tags)).catch(() => {});
  }, [language]);

  const onTitleChange = (value: string) => {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  };

  const addTag = (raw: string) => {
    const name = raw.trim();
    if (name && !tags.some((t) => t.toLowerCase() === name.toLowerCase())) setTags([...tags, name]);
    setTagInput('');
  };

  const onTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === 'Backspace' && !tagInput && tags.length) {
      setTags(tags.slice(0, -1));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!title.trim()) return setError('Title is required');
    if (status === 'scheduled' && !scheduledAt) return setError('Schedule date is required when status is scheduled');

    const finalTags = tagInput.trim() ? [...tags, tagInput.trim()] : tags;
    const body: Record<string, unknown> = {
      title: title.trim(),
      slug: slug.trim() || undefined,
      excerpt: excerpt || null,
      coverImage: coverImage || null,
      coverImageAlt: coverImageAlt || null,
      categoryId: categoryId || null,
      tags: finalTags,
      status,
      publishedAt: localToIso(publishedAt),
      scheduledAt: status === 'scheduled' ? localToIso(scheduledAt) : null,
      metaTitle: metaTitle || null,
      metaDescription: metaDescription || null,
      ogImage: ogImage || null,
      canonicalUrl: canonicalUrl || null,
      noindex,
    };

    setSaving(true);
    try {
      if (isNew) {
        const res = await blogApi.posts.create({ ...body, language });
        router.push(`/admin/blog/posts/${res.post.id}`);
      } else {
        await blogApi.posts.update(post.id, body);
        setTags(finalTags);
        setTagInput('');
        setSuccess('Post saved');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  const createTranslation = async () => {
    if (!newLanguage) return;
    setError('');
    try {
      const res = await blogApi.posts.addTranslation(post.id, newLanguage);
      router.push(`/admin/blog/posts/${res.post.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add translation');
    }
  };

  // Language tabs: siblings plus the current post.
  const siblings: { id: string; language: string }[] = post?.siblings ?? [];
  const tabs = siblings.some((s) => s.id === post?.id) ? siblings : post ? [...siblings, { id: post.id, language: post.language }] : [];
  const missingLanguages = BLOG_LANGUAGES.filter((l) => !tabs.some((t) => t.language === l.code));

  const serpTitle = metaTitle || title;
  const serpDescription = metaDescription || excerpt;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{isNew ? 'New Post' : 'Edit Post'}</h1>
        <div className="flex items-center gap-3">
          <Link href="/admin/blog/posts" className="text-gray-600 dark:text-gray-400">Back</Link>
          {!isNew && (
            <>
              <Link href={`/admin/blog/posts/${post.id}/preview`} className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">Preview</Link>
              <Link href={`/admin/blog/posts/${post.id}/builder`} className="px-3 py-2 rounded-lg bg-blue-600 text-white">Open builder</Link>
            </>
          )}
        </div>
      </div>

      {!isNew && (
        <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Translations">
          {tabs.map((t) => (
            <Link
              key={t.id}
              href={`/admin/blog/posts/${t.id}`}
              role="tab"
              aria-selected={t.id === post.id}
              className={`px-3 py-1 rounded-full text-sm ${t.id === post.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            >
              {t.language.toUpperCase()}
            </Link>
          ))}
          {missingLanguages.length > 0 && (
            <button type="button" onClick={() => { setShowTranslate(true); setNewLanguage(missingLanguages[0].code); }} className="px-3 py-1 rounded-full text-sm border border-dashed border-gray-400 text-gray-700 dark:text-gray-300">
              + Add translation
            </button>
          )}
        </div>
      )}

      {error && <div role="alert" className="p-3 rounded-lg bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300">{error}</div>}
      {success && <div role="status" className="p-3 rounded-lg bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300">{success}</div>}

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 space-y-4">
        <div>
          <label htmlFor="post-title" className={labelClass}>Title</label>
          <input id="post-title" value={title} onChange={(e) => onTitleChange(e.target.value)} className={inputClass} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="post-slug" className={labelClass}>Slug</label>
            <input id="post-slug" value={slug} onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }} className={inputClass} />
          </div>
          <div>
            <label htmlFor="post-language" className={labelClass}>Language</label>
            <select id="post-language" value={language} disabled={!isNew} onChange={(e) => { setLanguage(e.target.value); setCategoryId(''); }} className={inputClass}>
              {BLOG_LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="post-excerpt" className={labelClass}>Excerpt</label>
          <textarea id="post-excerpt" rows={3} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className={inputClass} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className={labelClass}>Cover image</span>
            {coverImage && <img src={coverImage} alt={coverImageAlt} className="mb-2 h-32 rounded object-cover" />}
            <div className="flex gap-2">
              <button type="button" onClick={() => setMediaTarget('cover')} className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">Choose image</button>
              {coverImage && <button type="button" onClick={() => setCoverImage('')} className="px-3 py-2 text-red-600">Remove</button>}
            </div>
          </div>
          <div>
            <label htmlFor="post-cover-alt" className={labelClass}>Cover alt text</label>
            <input id="post-cover-alt" value={coverImageAlt} onChange={(e) => setCoverImageAlt(e.target.value)} className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="post-category" className={labelClass}>Category</label>
            <select id="post-category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass}>
              <option value="">No category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <span className={labelClass}>Author</span>
            <p className="px-3 py-2 text-gray-700 dark:text-gray-300">{post?.author?.name ?? 'You (set on save)'}</p>
          </div>
        </div>

        <div>
          <label htmlFor="post-tags" className={labelClass}>Tags</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((t) => (
              <span key={t} className="inline-flex items-center gap-1 px-2 py-1 text-sm rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                {t}
                <button type="button" aria-label={`Remove tag ${t}`} onClick={() => setTags(tags.filter((x) => x !== t))}>×</button>
              </span>
            ))}
          </div>
          <input
            id="post-tags"
            list="post-tag-suggestions"
            value={tagInput}
            placeholder="Type a tag and press Enter or comma"
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={onTagKeyDown}
            onBlur={() => addTag(tagInput)}
            className={inputClass}
          />
          <datalist id="post-tag-suggestions">
            {tagSuggestions.map((t) => <option key={t.id} value={t.name} />)}
          </datalist>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="post-status" className={labelClass}>Status</label>
          <select id="post-status" value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
            {POST_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="post-published" className={labelClass}>Publish date</label>
          <input id="post-published" type="datetime-local" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} className={inputClass} />
        </div>
        {status === 'scheduled' && (
          <div>
            <label htmlFor="post-scheduled" className={labelClass}>Schedule date</label>
            <input id="post-scheduled" type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className={inputClass} />
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">SEO</h2>
        <div>
          <label htmlFor="post-meta-title" className={labelClass}>Meta title <span className="text-xs text-gray-500">({metaTitle.length}/60)</span></label>
          <input id="post-meta-title" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="post-meta-desc" className={labelClass}>Meta description <span className="text-xs text-gray-500">({metaDescription.length}/160)</span></label>
          <textarea id="post-meta-desc" rows={2} value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="post-og" className={labelClass}>OG image</label>
          <div className="flex gap-2">
            <input id="post-og" value={ogImage} onChange={(e) => setOgImage(e.target.value)} className={inputClass} />
            <button type="button" onClick={() => setMediaTarget('og')} className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 whitespace-nowrap">Choose</button>
          </div>
        </div>
        <div>
          <label htmlFor="post-canonical" className={labelClass}>Canonical URL</label>
          <input id="post-canonical" value={canonicalUrl} onChange={(e) => setCanonicalUrl(e.target.value)} className={inputClass} />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <input type="checkbox" checked={noindex} onChange={(e) => setNoindex(e.target.checked)} />
          noindex (hide from search engines)
        </label>

        <div data-testid="serp-preview" className="p-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-slate-900">
          <div className="text-xs text-green-700 dark:text-green-400 truncate">/{language}/blog/{slug}</div>
          <div className="text-lg text-blue-700 dark:text-blue-400 truncate">{serpTitle.slice(0, 60) || 'Post title'}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">{serpDescription.slice(0, 160) || 'Description shown in search results.'}</div>
        </div>
      </div>

      <button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium">
        {saving ? 'Saving...' : isNew ? 'Create post' : 'Save changes'}
      </button>

      <MediaBrowser
        isOpen={mediaTarget !== null}
        onClose={() => setMediaTarget(null)}
        acceptTypes={['image/*']}
        onSelect={(url) => {
          if (mediaTarget === 'cover') setCoverImage(url);
          else setOgImage(url);
          setMediaTarget(null);
        }}
      />

      {showTranslate && (
        <div role="dialog" aria-label="Add translation" className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-sm space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Add translation</h2>
            <select aria-label="Translation language" value={newLanguage} onChange={(e) => setNewLanguage(e.target.value)} className={inputClass}>
              {missingLanguages.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}
            </select>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowTranslate(false)} className="px-3 py-2 text-gray-600 dark:text-gray-300">Cancel</button>
              <button type="button" onClick={createTranslation} className="px-3 py-2 rounded-lg bg-indigo-600 text-white">Create</button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
