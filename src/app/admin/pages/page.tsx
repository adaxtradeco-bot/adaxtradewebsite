/**
 * Admin Pages - flat list by default, sorted by last updated.
 */

'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Toast from '@/components/ui/Toast';
import { PageListGrouped, type GroupView } from '@/components/admin/PageListGrouped';
import { PageListFlat } from '@/components/admin/PageListFlat';
import { ViewModeToggle } from '@/components/admin/ViewModeToggle';
import { CreatePageModal } from '@/components/admin/CreatePageModal';
import { AddTranslationModal } from '@/components/admin/AddTranslationModal';
import { DeleteDialog, DuplicateDialog } from '@/components/admin/PageDialogs';
import type { PageActionHandlers } from '@/components/admin/PageRowActions';
import { Icon } from '@/components/admin/icons';
import {
  DEFAULT_PREFS,
  adminHeaders,
  applyStatus,
  baseFilter,
  loadPrefs,
  savePrefs,
  sortPages,
  type AdminPage,
  type PagesListPrefs,
  type SortKey,
  type StatusFilter,
} from '@/lib/admin/pages-list';

const SORT_LABELS: Record<SortKey, string> = {
  updated: 'Last updated',
  title: 'Title',
  language: 'Language',
  status: 'Status',
};

const selectCls =
  'h-9 px-3 rounded-lg border border-[#D0D5DD] bg-white text-[13px] font-medium text-[#344054] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30';

export default function AdminPages() {
  const router = useRouter();
  const [prefs, setPrefs] = useState<PagesListPrefs>(DEFAULT_PREFS);
  const [prefsLoaded, setPrefsLoaded] = useState(false);
  const [search, setSearch] = useState('');
  const [groups, setGroups] = useState<GroupView[]>([]);
  const [ungrouped, setUngrouped] = useState<AdminPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [translateId, setTranslateId] = useState<string | null>(null);
  const [duplicating, setDuplicating] = useState<AdminPage | null>(null);
  const [deleting, setDeleting] = useState<AdminPage | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Preferences (localStorage, try/catch inside helpers)
  useEffect(() => {
    setPrefs(loadPrefs());
    setPrefsLoaded(true);
    if (new URLSearchParams(window.location.search).get('new') === '1') setShowCreate(true);
  }, []);
  useEffect(() => {
    if (prefsLoaded) savePrefs(prefs);
  }, [prefs, prefsLoaded]);
  const patch = (p: Partial<PagesListPrefs>) => setPrefs((cur) => ({ ...cur, ...p }));

  // "/" focuses the search box
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing = el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable);
      if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const fetchPages = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/pages/grouped?t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache', ...adminHeaders() },
      });
      const result = await res.json();
      if (result.success) {
        setGroups(
          result.data.groups.map((g: any) => ({
            id: g.id,
            name: g.name,
            slug: g.slug,
            pages: g.pages.map((p: any) => ({ ...p, pageGroupId: g.id, pageGroupName: g.name })),
          }))
        );
        setUngrouped(result.data.ungroupedPages);
        setLoadError(false);
      } else {
        setLoadError(true);
      }
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const allPages = useMemo(() => [...groups.flatMap((g) => g.pages), ...ungrouped], [groups, ungrouped]);
  const languages = useMemo(() => Array.from(new Set(allPages.map((p) => p.language))).sort(), [allPages]);

  const base = useMemo(() => baseFilter(allPages, search, prefs.language), [allPages, search, prefs.language]);
  const counts = {
    all: base.length,
    published: base.filter((p) => p.status === 'published').length,
    draft: base.filter((p) => p.status === 'draft').length,
  };
  const flat = useMemo(
    () => sortPages(applyStatus(base, prefs.status), prefs.sortKey, prefs.sortDir),
    [base, prefs.status, prefs.sortKey, prefs.sortDir]
  );

  const groupedView = useMemo(() => {
    const keep = new Set(flat.map((p) => p.id));
    const gs = groups
      .map((g) => ({ ...g, pages: g.pages.filter((p) => keep.has(p.id)) }))
      .filter((g) => g.pages.length > 0);
    const newest = (g: GroupView) => Math.max(...g.pages.map((p) => new Date(p.updatedAt).getTime()));
    gs.sort((a, b) =>
      prefs.sortKey === 'updated'
        ? (prefs.sortDir === 'desc' ? -1 : 1) * (newest(a) - newest(b))
        : (prefs.sortDir === 'desc' ? -1 : 1) * a.name.localeCompare(b.name)
    );
    return { groups: gs, ungrouped: ungrouped.filter((p) => keep.has(p.id)) };
  }, [groups, ungrouped, flat, prefs.sortKey, prefs.sortDir]);

  const resetKey = `${search}|${prefs.language}|${prefs.status}|${prefs.sortKey}|${prefs.sortDir}|${prefs.view}`;

  const onSort = (key: SortKey) =>
    patch(prefs.sortKey === key ? { sortDir: prefs.sortDir === 'desc' ? 'asc' : 'desc' } : { sortKey: key, sortDir: key === 'updated' ? 'desc' : 'asc' });

  const handleSetDefault = async (page: AdminPage) => {
    setSettingDefaultId(page.id);
    try {
      const res = await fetch(`/api/admin/pages/${page.id}/set-default`, { method: 'POST', headers: adminHeaders() });
      const result = await res.json();
      if (result.success) {
        setToast({ message: 'Default language updated', type: 'success' });
        fetchPages();
      } else {
        setToast({ message: result.error || 'Failed to set default page', type: 'error' });
      }
    } catch {
      setToast({ message: 'Failed to set default page', type: 'error' });
    } finally {
      setSettingDefaultId(null);
    }
  };

  const handlers: PageActionHandlers = {
    onDuplicate: setDuplicating,
    onDelete: setDeleting,
    onSetDefault: handleSetDefault,
    onAddTranslation: (p) => setTranslateId(p.id),
    settingDefaultId,
  };

  const siblingsOf = (page: AdminPage) =>
    page.pageGroupId ? allPages.filter((p) => p.pageGroupId === page.pageGroupId && p.id !== page.id) : [];

  const tabs: { id: StatusFilter; label: string; n: number }[] = [
    { id: 'all', label: 'All', n: counts.all },
    { id: 'published', label: 'Published', n: counts.published },
    { id: 'draft', label: 'Draft', n: counts.draft },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[28px] leading-tight font-bold text-[#101828]">Pages</h1>
          <p className="mt-1.5 text-[15px] text-[#475467]">
            {allPages.length} page{allPages.length !== 1 ? 's' : ''} · sorted by {SORT_LABELS[prefs.sortKey].toLowerCase()}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-medium"
        >
          <Icon name="plus" />
          Create new page
        </button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-[1_1_320px] max-w-[460px]">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#667085]" />
          <input
            ref={searchRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && (setSearch(''), searchRef.current?.blur())}
            placeholder="Search by title or slug"
            aria-label="Search pages"
            className="w-full h-10 pl-10 pr-10 border border-[#D0D5DD] rounded-lg bg-white text-sm text-[#101828] placeholder:text-[#667085] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 h-[22px] px-[7px] rounded-md border border-[#D0D5DD] text-xs font-semibold text-[#475467] inline-flex items-center">
            /
          </kbd>
        </div>

        <div className="inline-flex p-[3px] rounded-[10px] bg-[#F2F4F7]" role="tablist" aria-label="Status">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={prefs.status === t.id}
              onClick={() => patch({ status: t.id })}
              className={`inline-flex items-center gap-1.5 h-[30px] px-3 rounded-lg text-[13px] font-medium ${
                prefs.status === t.id ? 'bg-white text-[#101828] shadow-[0_1px_2px_rgba(16,24,40,.12)]' : 'text-[#475467]'
              }`}
            >
              {t.label} <span className="text-xs font-semibold text-[#667085]">{t.n}</span>
            </button>
          ))}
        </div>

        <select
          aria-label="Language filter"
          value={prefs.language}
          onChange={(e) => patch({ language: e.target.value })}
          className={selectCls}
        >
          <option value="all">Language: All</option>
          {languages.map((l) => (
            <option key={l} value={l}>
              Language: {l.toUpperCase()}
            </option>
          ))}
        </select>

        <div className="flex-1" />

        <div className="flex items-center gap-1">
          <select
            aria-label="Sort by"
            value={prefs.sortKey}
            onChange={(e) => patch({ sortKey: e.target.value as SortKey, sortDir: e.target.value === 'updated' ? 'desc' : 'asc' })}
            className={selectCls}
          >
            {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
              <option key={k} value={k}>
                Sort: {SORT_LABELS[k]}
              </option>
            ))}
          </select>
          <button
            onClick={() => patch({ sortDir: prefs.sortDir === 'desc' ? 'asc' : 'desc' })}
            aria-label={prefs.sortDir === 'desc' ? 'Descending' : 'Ascending'}
            title={prefs.sortDir === 'desc' ? 'Descending' : 'Ascending'}
            className="w-9 h-9 grid place-items-center rounded-lg border border-[#D0D5DD] bg-white text-[#344054] hover:bg-[#F9FAFB]"
          >
            <Icon name={prefs.sortDir === 'desc' ? 'arrowDown' : 'arrowUp'} size={16} />
          </button>
        </div>
        <ViewModeToggle value={prefs.view} onChange={(view) => patch({ view })} />
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-[#667085]">Loading pages…</div>
      ) : loadError ? (
        <div className="py-12 text-center text-sm text-[#B42318]">
          Could not load pages.{' '}
          <button className="underline" onClick={() => (setLoading(true), fetchPages())}>
            Retry
          </button>
        </div>
      ) : prefs.view === 'flat' ? (
        <PageListFlat
          pages={flat}
          totalCount={allPages.length}
          sortKey={prefs.sortKey}
          sortDir={prefs.sortDir}
          onSort={onSort}
          handlers={handlers}
          resetKey={resetKey}
        />
      ) : (
        <PageListGrouped
          groups={groupedView.groups}
          ungrouped={groupedView.ungrouped}
          allUngrouped={ungrouped}
          handlers={handlers}
          onGroupCreated={fetchPages}
          resetKey={resetKey}
        />
      )}

      <CreatePageModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={(pageId: string) => {
          setToast({ message: 'Page created successfully!', type: 'success' });
          fetchPages();
          setTimeout(() => router.push(`/admin/pages/builder/${pageId}`), 1000);
        }}
      />

      <AddTranslationModal
        isOpen={!!translateId}
        onClose={() => setTranslateId(null)}
        sourcePageId={translateId ?? ''}
        onSuccess={() => {
          setToast({ message: 'Translation created successfully!', type: 'success' });
          setTranslateId(null);
          fetchPages();
        }}
      />

      {duplicating && (
        <DuplicateDialog
          page={duplicating}
          onClose={() => setDuplicating(null)}
          onDone={(created, openBuilder) => {
            setDuplicating(null);
            setToast({ message: `Created “${created.title}” as a draft`, type: 'success' });
            if (openBuilder) router.push(`/admin/pages/builder/${created.id}`);
            else fetchPages();
          }}
        />
      )}

      {deleting && (
        <DeleteDialog
          page={deleting}
          siblings={siblingsOf(deleting)}
          onClose={() => setDeleting(null)}
          onDeleted={() => {
            setDeleting(null);
            setToast({ message: 'Page deleted', type: 'success' });
            fetchPages();
          }}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
