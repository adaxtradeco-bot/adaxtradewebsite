/** Styles and message list shared by the steps of the custom HTML import wizard. */
import React from 'react';

export const inputCls =
  'w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100';
const btnCls =
  'rounded-md px-3 py-1.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50';
export const btnPrimary = `${btnCls} bg-blue-600 text-white hover:bg-blue-700`;
export const btnGhost = `${btnCls} border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700`;

export function Messages({ items, tone }: { items: string[]; tone: 'warn' | 'error' }) {
  if (items.length === 0) return null;
  const cls =
    tone === 'error'
      ? 'border-red-300 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-900/20 dark:text-red-200'
      : 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-200';
  return (
    <ul
      role={tone === 'error' ? 'alert' : undefined}
      data-testid={tone === 'error' ? 'wizard-errors' : 'wizard-warnings'}
      className={`space-y-1 rounded-md border px-3 py-2 text-sm ${cls}`}
    >
      {items.map((m, i) => (
        <li key={i} className="whitespace-pre-wrap">{m}</li>
      ))}
    </ul>
  );
}
