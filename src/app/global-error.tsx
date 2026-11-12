'use client';

import { useEffect } from 'react';

// Replaces the root layout when it fails, so Tailwind may not be loaded here:
// styles are inline. Plain <a> is used for the home link because the router
// may be unavailable; a full page load is the safe way back.

const styles = {
  body: {
    margin: 0,
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '64px 16px',
    textAlign: 'center' as const,
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
    backgroundColor: '#ffffff',
    color: '#171717',
  },
  title: { fontSize: '30px', fontWeight: 700, margin: 0 },
  text: { marginTop: '16px', maxWidth: '448px', color: '#525252', lineHeight: 1.5 },
  reference: { marginTop: '12px', fontSize: '14px', color: '#737373' },
  actions: { marginTop: '32px', display: 'flex', flexWrap: 'wrap' as const, gap: '12px', justifyContent: 'center' },
  primary: {
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 500,
    cursor: 'pointer',
  },
  secondary: {
    padding: '12px 24px',
    borderRadius: '8px',
    border: '1px solid #d4d4d4',
    backgroundColor: 'transparent',
    color: '#171717',
    fontSize: '16px',
    fontWeight: 500,
    textDecoration: 'none',
  },
};

export default function GlobalError({
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
    <html lang="en">
      <body style={styles.body}>
        <h1 style={styles.title}>Something went wrong</h1>
        <p style={styles.text}>
          An error occurred while loading this page. Please try again or return to the home page.
        </p>
        {error.digest && <p style={styles.reference}>Reference: {error.digest}</p>}
        <div style={styles.actions}>
          <button type="button" onClick={() => reset()} style={styles.primary}>
            Try again
          </button>
          <a href="/" style={styles.secondary}>
            Back to home
          </a>
        </div>
      </body>
    </html>
  );
}
