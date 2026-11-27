'use client';

/**
 * Inline "Save to library" form of the Custom HTML property panel (admins; spec §11.3, §12).
 */
import React, { useState } from 'react';
import { createLibraryItem } from '@/lib/custom-html/library-client';
import type { CustomHtmlData } from '@/lib/custom-html/types';

const inputCls =
  'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm';
const btnCls = 'px-2.5 py-1.5 text-xs font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed';

export function SaveToLibraryForm({ data, onClose }: { data: CustomHtmlData; onClose: () => void }) {
  const [name, setName] = useState(data.name);
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || !name.trim()) return;
    setBusy(true);
    setError('');
    try {
      await createLibraryItem({ name: name.trim(), description: description.trim(), data });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save to the library.');
    } finally {
      setBusy(false);
    }
  };

  const boxCls = 'space-y-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 p-3';

  if (saved) {
    return (
      <div role="status" className={`${boxCls} flex items-center justify-between gap-2 text-xs text-green-700 dark:text-green-400`}>
        <span>Saved to library.</span>
        <button type="button" onClick={onClose} className={`${btnCls} text-gray-600 dark:text-gray-300 hover:underline`}>
          Close
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} aria-label="Save to library" className={boxCls}>
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
        Library name
        <input className={`${inputCls} mt-1`} value={name} maxLength={200} onChange={(e) => setName(e.target.value)} />
      </label>
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
        Description (optional)
        <input className={`${inputCls} mt-1`} value={description} maxLength={1000} onChange={(e) => setDescription(e.target.value)} />
      </label>
      <p className="text-[11px] text-gray-500 dark:text-gray-400">
        The code and default content are saved. Content edited on this page is not included.
      </p>
      {error && (
        <p role="alert" className="text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose} className={`${btnCls} text-gray-600 dark:text-gray-300 hover:underline`}>
          Cancel
        </button>
        <button type="submit" disabled={busy || !name.trim()} className={`${btnCls} bg-blue-600 text-white hover:bg-blue-700`}>
          {busy ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  );
}
