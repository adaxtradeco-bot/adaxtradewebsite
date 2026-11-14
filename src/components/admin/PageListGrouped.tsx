/**
 * PageListGrouped - pages grouped by PageGroup (languages of one page together).
 * Data and filtering are owned by the Pages screen.
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from './icons';
import { GroupPagesModal } from './GroupPagesModal';
import { PageRowActions, StatusBadge, type PageActionHandlers } from './PageRowActions';
import { PAGE_SIZE, type AdminPage } from '@/lib/admin/pages-list';

export interface GroupView {
  id: string;
  name: string;
  slug: string;
  pages: AdminPage[];
}

interface PageListGroupedProps {
  groups: GroupView[];
  ungrouped: AdminPage[];
  handlers: PageActionHandlers;
  /** All ungrouped pages (unfiltered) for the Create Group modal. */
  allUngrouped: AdminPage[];
  onGroupCreated: () => void;
  resetKey: string;
}

const isOutdated = (page: AdminPage) => {
  if (!page.lastSyncedAt) return false;
  return Date.now() - new Date(page.lastSyncedAt).getTime() > 7 * 24 * 60 * 60 * 1000;
};

export function PageListGrouped({
  groups,
  ungrouped,
  handlers,
  allUngrouped,
  onGroupCreated,
  resetKey,
}: PageListGroupedProps) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [limit, setLimit] = useState(PAGE_SIZE);

  useEffect(() => {
    setLimit(PAGE_SIZE);
  }, [resetKey]);

  const toggle = (id: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const shownGroups = groups.slice(0, limit);
  const remaining = groups.length - shownGroups.length;

  const row = (page: AdminPage, indent: boolean) => (
    <div
      key={page.id}
      className={`flex items-center justify-between gap-4 py-2.5 pr-5 border-b border-[#F2F4F7] last:border-b-0 hover:bg-[#F9FAFB] ${
        indent ? 'pl-14' : 'pl-5'
      }`}
    >
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <span className="inline-flex items-center h-[22px] px-2 rounded-md bg-[#F2F4F7] text-[#344054] text-xs font-semibold">
          {page.language.toUpperCase()}
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Link href={`/admin/pages/builder/${page.id}`} className="text-sm font-semibold text-[#101828] truncate hover:text-[#1D4ED8]">
              {page.title}
            </Link>
            {page.isDefaultLang && <span className="text-[11px] font-semibold text-[#1D4ED8]">★ Default</span>}
            {isOutdated(page) && (
              <span className="text-[11px] font-semibold text-[#B54708] bg-[#FFFAEB] px-1.5 rounded">Outdated</span>
            )}
          </div>
          <div className="font-mono text-xs text-[#667085] truncate">{page.slug}</div>
        </div>
        <StatusBadge status={page.status} />
      </div>
      <PageRowActions page={page} handlers={handlers} />
    </div>
  );

  return (
    <div className="space-y-3">
      {shownGroups.map((group) => {
        const open = !collapsed.has(group.id);
        return (
          <section key={group.id} className="bg-white border border-[#E4E7EC] rounded-xl">
            <div
              className="flex items-center justify-between gap-3 px-5 py-3.5 cursor-pointer hover:bg-[#F9FAFB] rounded-t-xl"
              onClick={() => toggle(group.id)}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon name={open ? 'chevronDown' : 'chevronRight'} className="text-[#667085]" />
                <Icon name="folder" className="text-[#98A2B3]" />
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-[#101828] truncate">{group.name}</h3>
                  <p className="text-xs text-[#667085]">
                    {group.pages.length} language{group.pages.length !== 1 ? 's' : ''} · /{group.slug}
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const base = group.pages.find((p) => p.isDefaultLang) || group.pages[0];
                  handlers.onAddTranslation?.(base);
                }}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-[#D0D5DD] bg-white text-[13px] font-medium text-[#101828] hover:bg-[#F9FAFB]"
              >
                <Icon name="plus" size={15} />
                Add Translation
              </button>
            </div>
            {open && <div className="border-t border-[#E4E7EC]">{group.pages.map((p) => row(p, true))}</div>}
          </section>
        );
      })}

      {ungrouped.length > 0 && (
        <section className="bg-white border border-[#E4E7EC] rounded-xl">
          <div className="px-5 py-3.5 border-b border-[#E4E7EC] flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#101828] flex items-center gap-2">
              <Icon name="globe" />
              Ungrouped pages ({ungrouped.length})
            </h3>
            <button
              onClick={() => setShowGroupModal(true)}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[13px] font-medium"
            >
              <Icon name="folder" size={15} />
              Create Group
            </button>
          </div>
          {ungrouped.map((p) => row(p, false))}
        </section>
      )}

      {groups.length === 0 && ungrouped.length === 0 && (
        <div className="text-center py-12 text-sm text-[#475467]">No pages match your filters.</div>
      )}

      {remaining > 0 && (
        <div className="text-center">
          <button
            onClick={() => setLimit((l) => l + PAGE_SIZE)}
            className="h-8 px-3 rounded-lg border border-[#D0D5DD] bg-white text-[13px] font-medium text-[#101828] hover:bg-[#F9FAFB]"
          >
            Show {Math.min(PAGE_SIZE, remaining)} more groups
          </button>
        </div>
      )}

      <GroupPagesModal
        isOpen={showGroupModal}
        onClose={() => setShowGroupModal(false)}
        onSuccess={() => {
          setShowGroupModal(false);
          onGroupCreated();
        }}
        ungroupedPages={allUngrouped as any}
      />
    </div>
  );
}
