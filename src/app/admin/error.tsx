'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow dark:bg-gray-800">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Something went wrong</h1>
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
          This admin page failed to load. Try again, or go back to the admin dashboard.
        </p>
        {error.digest && (
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">Reference: {error.digest}</p>
        )}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Try again
          </button>
          <Link
            href="/admin"
            className="inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
