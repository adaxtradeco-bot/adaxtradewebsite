'use client';

/**
 * Saved Custom HTML templates inside the section library (spec §11.1, §12).
 * Admins and editors insert; admins also rename and delete. An inserted section is an independent
 * copy, so later library changes never touch it.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { SectionConfig } from '@/lib/page-builder/section-schemas';
import { CHS_EVENTS, canEditCodeClient } from '@/lib/custom-html/client-role';
import {
  deleteLibraryItem,
  fetchLibraryItemForInsert,
  listLibrary,
  updateLibraryItem,
  type LibraryItemSummary,
} from '@/lib/custom-html/library-client';
import { CUSTOM_HTML_TYPE } from '@/lib/custom-html/types';

export interface LibraryPickerProps {
  /** filters by name and description */
  search?: string;
  onInsert: (section: SectionConfig) => void;
}

const inputCls =
  'w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1.5 text-sm text-gray-900 dark:text-white';
const linkCls = 'text-[11px] font-medium hover:underline disabled:opacity-50';
const noteCls = 'text-xs text-gray-500 dark:text-gray-400 italic ml-2';

function message(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

export function LibraryPicker({ search = '', onInsert }: LibraryPickerProps) {
  const [items, setItems] = useState<LibraryItemSummary[] | null>(null);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<{ id: string; name: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const busyRef = useRef(false);
  const requestRef = useRef(0);

  const load = useCallback(async () => {
    const request = ++requestRef.current;
    setError('');
    try {
      const list = await listLibrary();
      if (request === requestRef.current) setItems(list);
    } catch (err) {
      if (request !== requestRef.current) return;
      setItems((prev) => prev ?? []);
      setError(message(err, 'Could not load the library.'));
    }
  }, []);

  useEffect(() => {
    setIsAdmin(canEditCodeClient());
    load();
    window.addEventListener(CHS_EVENTS.libraryChanged, load);
    return () => window.removeEventListener(CHS_EVENTS.libraryChanged, load);
  }, [load]);

  /** One request at a time (a double click must not insert twice). */
  const run = async (id: string, action: () => Promise<void>, fallback: string) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusyId(id);
    setError('');
    try {
      await action();
    } catch (err) {
      setError(message(err, fallback));
    } finally {
      busyRef.current = false;
      setBusyId(null);
    }
  };

  const insert = (id: string) =>
    run(
      id,
      async () => {
        const item = await fetchLibraryItemForInsert(id);
        const { runInBuilder: _run, ...data } = item.data;
        onInsert({
          id: `section-${Date.now()}`,
          type: CUSTOM_HTML_TYPE,
          order: 0,
          data: { ...data, libraryId: item.id, values: {} },
        } as unknown as SectionConfig);
        setItems((prev) => prev && prev.map((i) => (i.id === id ? { ...i, usageCount: item.usageCount } : i)));
      },
      'Could not insert this section.',
    );

  const rename = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renaming || !renaming.name.trim()) return;
    const { id, name } = renaming;
    run(
      id,
      async () => {
        await updateLibraryItem(id, { name: name.trim() });
        setRenaming(null);
      },
      'Could not rename this item.',
    );
  };

  const remove = (item: LibraryItemSummary) => {
    if (!window.confirm(`Delete "${item.name}" from the library? Sections already placed on pages are not affected.`)) return;
    run(item.id, () => deleteLibraryItem(item.id), 'Could not delete this item.');
  };

  const query = search.trim().toLowerCase();
  const shown = (items ?? []).filter(
    (i) => !query || i.name.toLowerCase().includes(query) || (i.description || '').toLowerCase().includes(query),
  );

  return (
    <div data-testid="custom-html-library" className="space-y-2">
      {error && (
        <div role="alert" className="rounded-md border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 p-2 text-xs text-red-700 dark:text-red-300">
          {error}{' '}
          <button type="button" className="font-medium underline" onClick={() => load()}>
            Retry
          </button>
        </div>
      )}
      {items === null && <p className={noteCls}>Loading saved sections…</p>}
      {items !== null && !error && shown.length === 0 && (
        <p className={noteCls}>{query ? 'No sections found' : 'No saved sections yet'}</p>
      )}
      {shown.map((item) => (
        <div key={item.id} data-testid="library-item" className="rounded-lg border border-gray-200 dark:border-gray-600">
          {renaming?.id === item.id ? (
            <form onSubmit={rename} className="space-y-2 p-3">
              <input
                autoFocus
                aria-label={`New name for ${item.name}`}
                className={inputCls}
                value={renaming.name}
                maxLength={200}
                onChange={(e) => setRenaming({ id: item.id, name: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setRenaming(null);
                }}
              />
              <div className="flex justify-end gap-3">
                <button type="button" className={`${linkCls} text-gray-600 dark:text-gray-300`} onClick={() => setRenaming(null)}>
                  Cancel
                </button>
                <button type="submit" className={`${linkCls} text-blue-600 dark:text-blue-400`} disabled={busyId !== null || !renaming.name.trim()}>
                  Save
                </button>
              </div>
            </form>
          ) : (
            <>
              <button
                type="button"
                onClick={() => insert(item.id)}
                disabled={busyId !== null}
                aria-label={`Insert ${item.name}`}
                className="w-full rounded-lg p-3 text-left transition-all hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-60"
              >
                <span className="block break-words text-sm font-medium text-gray-900 dark:text-white">{item.name}</span>
                {item.description && (
                  <span className="mt-1 block text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{item.description}</span>
                )}
                <span className="mt-1 block text-[11px] text-gray-400">
                  {busyId === item.id ? 'Working…' : `Used ${item.usageCount} ${item.usageCount === 1 ? 'time' : 'times'}`}
                </span>
              </button>
              {isAdmin && (
                <div className="flex justify-end gap-3 border-t border-gray-100 dark:border-gray-700 px-3 py-1.5">
                  <button
                    type="button"
                    aria-label={`Rename ${item.name}`}
                    className={`${linkCls} text-blue-600 dark:text-blue-400`}
                    disabled={busyId !== null}
                    onClick={() => setRenaming({ id: item.id, name: item.name })}
                  >
                    Rename
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${item.name}`}
                    className={`${linkCls} text-red-600 dark:text-red-400`}
                    disabled={busyId !== null}
                    onClick={() => remove(item)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}

export default LibraryPicker;
