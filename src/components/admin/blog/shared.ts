import { useAdminUser } from '@/hooks/useAdminUser';
import { getPermissions } from '@/lib/permissions';

// Same language set the pages "Add translation" dialog offers.
export const BLOG_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'fa', name: 'Persian' },
  { code: 'ar', name: 'Arabic' },
  { code: 'fr', name: 'French' },
  { code: 'tr', name: 'Turkish' },
  { code: 'de', name: 'German' },
  { code: 'es', name: 'Spanish' },
];

export const POST_STATUS_OPTIONS = ['draft', 'scheduled', 'published', 'archived'];

export const STATUS_BADGE: Record<string, string> = {
  published: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  archived: 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
};

export const inputClass =
  'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white';

export function useCanDelete(): boolean {
  const { user } = useAdminUser();
  return getPermissions(user?.role ?? '').canDelete;
}

/** Converts a datetime-local value ("2026-01-02T10:30") to an ISO string with the local offset. */
export function localToIso(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const off = -d.getTimezoneOffset();
  const sign = off >= 0 ? '+' : '-';
  const pad = (n: number) => String(Math.floor(Math.abs(n))).padStart(2, '0');
  return `${value.length === 16 ? `${value}:00` : value}${sign}${pad(off / 60)}:${pad(off % 60)}`;
}

/** Converts an ISO string to a datetime-local value in the browser's time zone. */
export function isoToLocal(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}
