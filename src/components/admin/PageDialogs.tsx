/**
 * Duplicate + Delete dialogs for the admin Pages list.
 */

'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Icon, type IconName } from './icons';
import { adminHeaders, type AdminPage } from '@/lib/admin/pages-list';

function Shell({
  icon,
  tone,
  title,
  subtitle,
  onClose,
  children,
}: {
  icon: IconName;
  tone: 'blue' | 'red';
  title: string;
  subtitle: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] bg-[#475467]/70 grid place-items-center p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-[440px] bg-white rounded-2xl p-6 shadow-[0_24px_48px_rgba(16,24,40,.28)] flex flex-col gap-4"
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-[10px] grid place-items-center ${
              tone === 'red' ? 'bg-[#FEF3F2] text-[#B42318]' : 'bg-[#EEF4FF] text-[#1D4ED8]'
            }`}
          >
            <Icon name={icon} />
          </div>
          <div>
            <div className="text-[17px] font-bold text-[#101828]">{title}</div>
            <div className="text-[13px] text-[#667085]">{subtitle}</div>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

const field =
  'w-full h-10 border border-[#D0D5DD] rounded-lg px-3 text-sm bg-white text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]';
const btn =
  'inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg border border-[#D0D5DD] bg-white text-sm font-medium text-[#101828] hover:bg-[#F9FAFB] disabled:opacity-60';

export function DuplicateDialog({
  page,
  onClose,
  onDone,
}: {
  page: AdminPage;
  onClose: () => void;
  onDone: (created: { id: string; title: string }, openBuilder: boolean) => void;
}) {
  const [title, setTitle] = useState(`${page.title} copy`);
  const [slug, setSlug] = useState(`${page.slug}-copy`);
  const [openBuilder, setOpenBuilder] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/pages/${page.id}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...adminHeaders() },
        body: JSON.stringify({ title, slug }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        setError(json.error || 'Failed to duplicate page');
        return;
      }
      onDone(json.page, openBuilder);
    } catch {
      setError('Failed to duplicate page');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Shell icon="copy" tone="blue" title="Duplicate page" subtitle="Copies all sections, CSS and SEO fields" onClose={onClose}>
      <div>
        <label className="block text-[13px] font-semibold text-[#344054] mb-1.5">Title</label>
        <input className={field} value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
      </div>
      <div>
        <label className="block text-[13px] font-semibold text-[#344054] mb-1.5">Slug</label>
        <input className={`${field} font-mono text-[13px]`} value={slug} onChange={(e) => setSlug(e.target.value)} />
      </div>
      <label className="flex items-center gap-2.5 text-sm text-[#344054]">
        <input type="checkbox" checked disabled className="w-[18px] h-[18px] accent-[#2563EB]" />
        Save as draft
      </label>
      <label className="flex items-center gap-2.5 text-sm text-[#344054]">
        <input
          type="checkbox"
          checked={openBuilder}
          onChange={(e) => setOpenBuilder(e.target.checked)}
          className="w-[18px] h-[18px] accent-[#2563EB]"
        />
        Open in builder after creating
      </label>
      {error && <p className="text-[13px] text-[#B42318]">{error}</p>}
      <div className="flex gap-2 justify-end pt-1">
        <button className={btn} onClick={onClose} disabled={busy}>
          Cancel
        </button>
        <button
          className={`${btn} !bg-[#2563EB] !border-[#2563EB] !text-white hover:!bg-[#1D4ED8]`}
          onClick={submit}
          disabled={busy || !title.trim() || !slug.trim()}
        >
          {busy ? 'Duplicating…' : 'Duplicate'}
        </button>
      </div>
    </Shell>
  );
}

export function DeleteDialog({
  page,
  siblings,
  onClose,
  onDeleted,
}: {
  page: AdminPage;
  /** Other pages in the same group (languages that stay behind). */
  siblings: AdminPage[];
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const ok = typed.trim() === page.slug;

  const submit = async () => {
    if (!ok) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/pages/${page.id}`, { method: 'DELETE', headers: adminHeaders() });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false) {
        setError(json.error || 'Failed to delete page');
        return;
      }
      onDeleted();
    } catch {
      setError('Failed to delete page');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Shell icon="trash" tone="red" title="Delete this page?" subtitle="This cannot be undone" onClose={onClose}>
      <div className="px-3.5 py-3 rounded-[10px] bg-[#F9FAFB] border border-[#E4E7EC]">
        <div className="text-sm font-semibold text-[#101828]">{page.title}</div>
        <div className="font-mono text-xs text-[#667085] mt-0.5">{page.slug}</div>
      </div>
      {page.isHomepage && (
        <div className="px-3.5 py-3 rounded-[10px] bg-[#FEF3F2] border border-[#FECDCA] text-[13px] text-[#B42318] leading-normal">
          This is the homepage. Deleting it leaves the site without one.
        </div>
      )}
      {page.pageGroupName && (
        <div className="px-3.5 py-3 rounded-[10px] bg-[#FFFAEB] border border-[#FEDF89] text-[13px] text-[#93370D] leading-normal">
          It belongs to the group “{page.pageGroupName}”.{' '}
          {siblings.length > 0
            ? `The ${siblings.map((s) => s.language.toUpperCase()).join(', ')} version${
                siblings.length > 1 ? 's stay' : ' stays'
              } in the group.`
            : 'It is the only page in the group, so the group is removed too.'}
        </div>
      )}
      <div>
        <label className="block text-[13px] font-semibold text-[#344054] mb-1.5">Type the slug to confirm</label>
        <input
          ref={inputRef}
          className={`${field} font-mono text-[13px]`}
          value={typed}
          placeholder={page.slug}
          onChange={(e) => setTyped(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          autoFocus
        />
      </div>
      {error && <p className="text-[13px] text-[#B42318]">{error}</p>}
      <div className="flex gap-2 justify-end pt-1">
        <button className={btn} onClick={onClose} disabled={busy}>
          Cancel
        </button>
        <button
          className={`${btn} !bg-[#B42318] !border-[#B42318] !text-white hover:!bg-[#912018] disabled:!opacity-55`}
          onClick={submit}
          disabled={!ok || busy}
        >
          {busy ? 'Deleting…' : 'Delete page'}
        </button>
      </div>
    </Shell>
  );
}
