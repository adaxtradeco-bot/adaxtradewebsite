'use client';

import { useCallback, useEffect, useState } from 'react';
import { blogApi, BlogTerm } from '@/lib/admin/api';
import Toast from '@/components/ui/Toast';
import { BLOG_LANGUAGES, inputClass, useCanDelete } from './shared';

type Kind = 'categories' | 'tags';

interface Draft {
  name: string;
  slug: string;
  language: string;
  groupKey: string;
}

const emptyDraft = (language: string): Draft => ({ name: '', slug: '', language, groupKey: '' });

/** Inline list/create/edit/delete for blog categories or tags. */
export function TermManager({ kind }: { kind: Kind }) {
  const isCategories = kind === 'categories';
  const label = isCategories ? 'Category' : 'Tag';
  const canDelete = useCanDelete();
  const [terms, setTerms] = useState<BlogTerm[]>([]);
  const [language, setLanguage] = useState('');
  const [draft, setDraft] = useState<Draft>(emptyDraft('en'));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Draft>(emptyDraft('en'));
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const api = isCategories ? blogApi.categories : blogApi.tags;

  const load = useCallback(async () => {
    try {
      const data = await api.list(language || undefined);
      setTerms('categories' in data ? data.categories : data.tags);
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : 'Failed to load', type: 'error' });
    }
  }, [api, language]);

  useEffect(() => {
    load();
  }, [load]);

  const payload = (d: Draft) => ({
    name: d.name.trim(),
    language: d.language,
    ...(d.slug.trim() && { slug: d.slug.trim() }),
    ...(isCategories && { groupKey: d.groupKey.trim() || null }),
  });

  const run = async (fn: () => Promise<unknown>, ok: string) => {
    try {
      await fn();
      setToast({ message: ok, type: 'success' });
      await load();
      return true;
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : 'Request failed', type: 'error' });
      return false;
    }
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.name.trim()) return;
    if (await run(() => api.create(payload(draft)), `${label} created`)) setDraft(emptyDraft(draft.language));
  };

  const saveEdit = async (id: string) => {
    if (await run(() => api.update(id, payload(editDraft)), `${label} updated`)) setEditingId(null);
  };

  const remove = async (term: BlogTerm) => {
    if (!window.confirm(`Delete "${term.name}"?`)) return;
    await run(() => api.remove(term.id), `${label} deleted`);
  };

  const groupKeys = Array.from(new Set(terms.map((t) => t.groupKey).filter(Boolean))) as string[];

  const fields = (d: Draft, set: (d: Draft) => void, prefix: string) => (
    <>
      <input aria-label={`${prefix} name`} placeholder="Name" value={d.name} onChange={(e) => set({ ...d, name: e.target.value })} className={inputClass} />
      <input aria-label={`${prefix} slug`} placeholder="Slug (optional)" value={d.slug} onChange={(e) => set({ ...d, slug: e.target.value })} className={inputClass} />
      <select aria-label={`${prefix} language`} value={d.language} onChange={(e) => set({ ...d, language: e.target.value })} className={inputClass}>
        {BLOG_LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}
      </select>
      {isCategories && (
        <input aria-label={`${prefix} group key`} list="blog-group-keys" placeholder="Group key (links languages)" value={d.groupKey} onChange={(e) => set({ ...d, groupKey: e.target.value })} className={inputClass} />
      )}
    </>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Blog {label === 'Tag' ? 'Tags' : 'Categories'}</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Organised per language</p>
        </div>
        <select aria-label="Filter language" value={language} onChange={(e) => setLanguage(e.target.value)} className={`${inputClass} w-48`}>
          <option value="">All languages</option>
          {BLOG_LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}
        </select>
      </div>

      <datalist id="blog-group-keys">
        {groupKeys.map((k) => <option key={k} value={k} />)}
      </datalist>

      <form onSubmit={create} className={`grid gap-3 mb-6 ${isCategories ? 'md:grid-cols-5' : 'md:grid-cols-4'}`}>
        {fields(draft, setDraft, 'New')}
        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium">Add {label.toLowerCase()}</button>
      </form>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-slate-700">
            <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Language</th>
              {isCategories && <th className="px-4 py-3">Group key</th>}
              <th className="px-4 py-3">Posts</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {terms.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-500">Nothing here yet</td></tr>
            )}
            {terms.map((term) =>
              editingId === term.id ? (
                <tr key={term.id}>
                  <td colSpan={isCategories ? 4 : 3} className="px-4 py-3">
                    <div className={`grid gap-2 ${isCategories ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>{fields(editDraft, setEditDraft, 'Edit')}</div>
                  </td>
                  <td className="px-4 py-3 text-sm">{term._count.posts}</td>
                  <td className="px-4 py-3 text-right text-sm space-x-3">
                    <button onClick={() => saveEdit(term.id)} className="text-indigo-600 dark:text-indigo-400">Save</button>
                    <button onClick={() => setEditingId(null)} className="text-gray-600 dark:text-gray-400">Cancel</button>
                  </td>
                </tr>
              ) : (
                <tr key={term.id}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{term.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{term.slug}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{term.language.toUpperCase()}</td>
                  {isCategories && <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{term.groupKey ?? '—'}</td>}
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{term._count.posts}</td>
                  <td className="px-4 py-3 text-right text-sm space-x-3">
                    <button
                      onClick={() => {
                        setEditingId(term.id);
                        setEditDraft({ name: term.name, slug: term.slug, language: term.language, groupKey: term.groupKey ?? '' });
                      }}
                      className="text-indigo-600 dark:text-indigo-400"
                    >
                      Edit
                    </button>
                    {canDelete && <button onClick={() => remove(term)} className="text-red-600 dark:text-red-400">Delete</button>}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
