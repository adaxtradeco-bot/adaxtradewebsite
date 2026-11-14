/**
 * PageListFlat - flat, sortable list of pages with row actions.
 * Data, filtering and sorting are owned by the Pages screen.
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from './icons';
import { PageRowActions, StatusBadge, type PageActionHandlers } from './PageRowActions';
import { PAGE_SIZE, formatDate, type AdminPage, type SortDir, type SortKey } from '@/lib/admin/pages-list';

interface PageListFlatProps {
  pages: AdminPage[];
  totalCount: number;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
  handlers: PageActionHandlers;
  /** Changes whenever filters change, so "show more" starts over. */
  resetKey: string;
}

const COLS =
  'grid grid-cols-[minmax(0,2.4fr)_76px_110px_104px_232px] xl:grid-cols-[minmax(0,2.4fr)_76px_minmax(0,1fr)_110px_120px_232px] gap-4 items-center px-5';

function SortHead({
  label,
  k,
  sortKey,
  sortDir,
  onSort,
  className = '',
}: {
  label: string;
  k: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (k: SortKey) => void;
  className?: string;
}) {
  const active = sortKey === k;
  return (
    <button
      onClick={() => onSort(k)}
      className={`text-left uppercase tracking-[.04em] ${active ? 'text-[#101828]' : ''} ${className}`}
      aria-label={`Sort by ${label}`}
    >
      {label}
      {active ? (sortDir === 'desc' ? ' ↓' : ' ↑') : ''}
    </button>
  );
}

export function PageListFlat({ pages, totalCount, sortKey, sortDir, onSort, handlers, resetKey }: PageListFlatProps) {
  const [limit, setLimit] = useState(PAGE_SIZE);

  useEffect(() => {
    setLimit(PAGE_SIZE);
  }, [resetKey]);

  const shown = pages.slice(0, limit);
  const remaining = pages.length - shown.length;

  return (
    <section className="bg-white border border-[#E4E7EC] rounded-xl flex flex-col">
      <div
        className={`${COLS} h-[42px] bg-[#F9FAFB] border-b border-[#E4E7EC] rounded-t-xl text-xs font-semibold text-[#667085]`}
      >
        <SortHead label="Page" k="title" {...{ sortKey, sortDir, onSort }} />
        <SortHead label="Lang" k="language" {...{ sortKey, sortDir, onSort }} />
        <div className="hidden xl:block uppercase tracking-[.04em]">Group</div>
        <SortHead label="Status" k="status" {...{ sortKey, sortDir, onSort }} />
        <SortHead label="Updated" k="updated" {...{ sortKey, sortDir, onSort }} className="hidden xl:block" />
        <div className="text-right uppercase tracking-[.04em]">Actions</div>
      </div>

      {shown.map((page) => (
        <div key={page.id} className={`${COLS} min-h-[60px] py-2 border-b border-[#F2F4F7] hover:bg-[#F9FAFB]`}>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Link
                href={`/admin/pages/builder/${page.id}`}
                className="text-sm font-semibold text-[#101828] truncate hover:text-[#1D4ED8]"
              >
                {page.title}
              </Link>
              {page.isHomepage && (
                <span className="inline-flex items-center h-[22px] px-2 rounded-md bg-[#EEF4FF] text-[#1D4ED8] text-xs font-semibold">
                  Homepage
                </span>
              )}
            </div>
            <div className="font-mono text-xs text-[#667085] mt-0.5 truncate">{page.slug}</div>
          </div>
          <div className="flex flex-col gap-1 items-start">
            <span className="inline-flex items-center h-[22px] px-2 rounded-md bg-[#F2F4F7] text-[#344054] text-xs font-semibold">
              {page.language.toUpperCase()}
            </span>
            {page.isDefaultLang && (
              <span className="text-[11px] font-semibold text-[#1D4ED8] whitespace-nowrap">★ Default</span>
            )}
          </div>
          <div className="hidden xl:flex items-center gap-1.5 min-w-0 text-[13px] text-[#475467]">
            {page.pageGroupName ? (
              <>
                <Icon name="folder" size={15} className="text-[#98A2B3]" />
                <span className="truncate">{page.pageGroupName}</span>
              </>
            ) : (
              <span className="text-[#98A2B3]">—</span>
            )}
          </div>
          <div>
            <StatusBadge status={page.status} />
          </div>
          <div className="hidden xl:block text-[13px] text-[#475467]">{formatDate(page.updatedAt)}</div>
          <PageRowActions page={page} handlers={handlers} />
        </div>
      ))}

      {pages.length === 0 && (
        <div className="text-center py-12 text-sm text-[#475467]">No pages match your filters.</div>
      )}

      <div className="flex items-center justify-between px-5 py-3 text-[13px] text-[#475467]">
        <span>
          Showing {shown.length} of {totalCount === pages.length ? totalCount : `${pages.length} (${totalCount} total)`}{' '}
          pages
        </span>
        {remaining > 0 && (
          <button
            onClick={() => setLimit((l) => l + PAGE_SIZE)}
            className="h-8 px-3 rounded-lg border border-[#D0D5DD] bg-white text-[13px] font-medium text-[#101828] hover:bg-[#F9FAFB]"
          >
            Show {Math.min(PAGE_SIZE, remaining)} more
          </button>
        )}
      </div>
    </section>
  );
}
