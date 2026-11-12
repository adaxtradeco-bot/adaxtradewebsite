'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getErrorMessages, getLangDir, resolveLang } from '@/lib/i18n/error-messages';

export default function LocalizedError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const params = useParams();
  const lang = resolveLang(params?.lang);
  const m = getErrorMessages(lang);

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      dir={getLangDir(lang)}
      className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center bg-white text-neutral-900 dark:bg-neutral-900 dark:text-white"
    >
      <h1 className="text-3xl font-bold">{m.errorTitle}</h1>
      <p className="mt-4 max-w-md text-neutral-600 dark:text-neutral-300">{m.errorBody}</p>
      {error.digest && (
        <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">{error.digest}</p>
      )}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          {m.retry}
        </button>
        <Link
          href={`/${lang}`}
          className="inline-flex items-center rounded-lg border border-neutral-300 px-6 py-3 font-medium text-neutral-900 hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-neutral-600 dark:text-white dark:hover:bg-neutral-800"
        >
          {m.home}
        </Link>
      </div>
    </div>
  );
}
