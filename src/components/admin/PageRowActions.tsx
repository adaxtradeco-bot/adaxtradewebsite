/**
 * Row actions for a page: Open builder (primary), Settings, kebab menu.
 */

'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Icon, type IconName } from './icons';
import type { AdminPage } from '@/lib/admin/pages-list';

export interface PageActionHandlers {
  onDuplicate: (page: AdminPage) => void;
  onDelete: (page: AdminPage) => void;
  onSetDefault: (page: AdminPage) => void;
  onAddTranslation?: (page: AdminPage) => void;
  settingDefaultId?: string | null;
}

export function PageRowActions({ page, handlers }: { page: AdminPage; handlers: PageActionHandlers }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const item = (icon: IconName, label: string, onClick: () => void, danger = false, disabled = false) => (
    <button
      role="menuitem"
      disabled={disabled}
      onClick={() => {
        setOpen(false);
        onClick();
      }}
      className={`w-full flex items-center gap-2.5 h-9 px-3 rounded-md text-sm text-left hover:bg-[#F2F4F7] disabled:opacity-50 ${
        danger ? 'text-[#B42318]' : 'text-[#101828]'
      }`}
    >
      <Icon name={icon} />
      {label}
    </button>
  );

  const canSetDefault = !!page.pageGroupId && !page.isDefaultLang;
  const live = page.slug.startsWith('/') ? page.slug : `/${page.slug}`;

  return (
    <div className="relative flex items-center justify-end gap-1.5" ref={ref}>
      <Link
        href={`/admin/pages/builder/${page.id}`}
        className="inline-flex items-center gap-2 h-8 px-3 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[13px] font-medium whitespace-nowrap"
      >
        <Icon name="pen" size={15} />
        Open builder
      </Link>
      <Link
        href={`/admin/pages/settings/${page.id}`}
        aria-label="Page settings"
        title="Page settings"
        className="w-8 h-8 grid place-items-center rounded-lg text-[#475467] hover:bg-[#F2F4F7]"
      >
        <Icon name="sliders" />
      </Link>
      <button
        aria-label="More actions"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`w-8 h-8 grid place-items-center rounded-lg border ${
          open ? 'bg-[#F2F4F7] border-[#D0D5DD] text-[#101828]' : 'border-transparent text-[#475467] hover:bg-[#F2F4F7]'
        }`}
      >
        <Icon name="dots" strokeWidth={3} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-10 z-30 w-[248px] p-1.5 rounded-[10px] bg-white border border-[#E4E7EC] shadow-[0_12px_32px_rgba(16,24,40,.16)] text-left"
        >
          {item('copy', 'Duplicate', () => handlers.onDuplicate(page))}
          {canSetDefault &&
            item(
              'star',
              handlers.settingDefaultId === page.id ? 'Setting default…' : 'Set as default language',
              () => handlers.onSetDefault(page),
              false,
              handlers.settingDefaultId === page.id
            )}
          <a
            role="menuitem"
            href={live}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 h-9 px-3 rounded-md text-sm text-[#101828] hover:bg-[#F2F4F7]"
          >
            <Icon name="external" />
            View live page
          </a>
          {handlers.onAddTranslation &&
            item('globe', 'Add translation', () => handlers.onAddTranslation!(page))}
          <div className="h-px bg-[#E4E7EC] my-1" />
          {item('trash', 'Delete…', () => handlers.onDelete(page), true)}
        </div>
      )}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const published = status === 'published';
  return (
    <span
      className={`inline-flex items-center h-6 px-2.5 rounded-full text-xs font-semibold ${
        published ? 'bg-[#ECFDF3] text-[#067647]' : status === 'archived' ? 'bg-[#FEF3F2] text-[#B42318]' : 'bg-[#F2F4F7] text-[#475467]'
      }`}
    >
      {status}
    </span>
  );
}
