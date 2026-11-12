'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function ErrorPage({
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
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 text-center bg-white text-neutral-900 dark:bg-neutral-900 dark:text-white">
      <h1 className="text-3xl font-bold">Something went wrong</h1>
      <p className="mt-4 max-w-md text-neutral-600 dark:text-neutral-300">
        An error occurred while loading this page. Please try again or return to the home page.
      </p>
      {error.digest && (
        <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">Reference: {error.digest}</p>
      )}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex items-center rounded-lg border border-neutral-300 px-6 py-3 font-medium text-neutral-900 hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-neutral-600 dark:text-white dark:hover:bg-neutral-800"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
