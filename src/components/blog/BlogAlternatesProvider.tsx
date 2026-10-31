'use client';

import { useEffect } from 'react';
import { setBlogAlternates, type BlogAlternates } from './blog-alternates';

/** Renders nothing; publishes the post's language alternates for the language switcher. */
export function BlogAlternatesProvider({ alternates }: { alternates: BlogAlternates | null }) {
  const key = alternates ? JSON.stringify(alternates) : '';
  useEffect(() => {
    setBlogAlternates(key ? JSON.parse(key) : null);
    return () => setBlogAlternates(null);
  }, [key]);
  return null;
}
