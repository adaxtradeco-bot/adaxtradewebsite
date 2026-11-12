'use client';

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { getErrorMessages, getLangDir, resolveLang } from '@/lib/i18n/error-messages';

export default function LocalizedNotFound() {
  const params = useParams();
  const pathname = usePathname();
  // Prefer the route param; fall back to the first path segment, then English.
  const lang = resolveLang(params?.lang ?? pathname?.split('/')[1]);
  const m = getErrorMessages(lang);

  return (
    <div
      dir={getLangDir(lang)}
      className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center bg-white text-neutral-900 dark:bg-neutral-900 dark:text-white"
    >
      <p className="text-7xl font-bold text-neutral-500 dark:text-neutral-400">404</p>
      <h1 className="mt-4 text-3xl font-bold">{m.notFoundTitle}</h1>
      <p className="mt-4 max-w-md text-neutral-600 dark:text-neutral-300">{m.notFoundBody}</p>
      <Link
        href={`/${lang}`}
        className="mt-8 inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      >
        {m.home}
      </Link>
    </div>
  );
}
