/**
 * Central brand / site identity. Values come from environment variables so a
 * deployment can be branded without code changes. Safe to import from both
 * server and client components (NEXT_PUBLIC_* values are inlined at build time).
 *
 * Note: each NEXT_PUBLIC_* variable must be referenced literally (no dynamic
 * lookup) so Next.js can inline it into client bundles.
 */
export interface Brand {
  /** Full site / company name */
  name: string;
  /** Short name (used where space is tight); defaults to `name` */
  shortName: string;
  /** Canonical base URL without trailing slash */
  url: string;
  /** Public contact email */
  contactEmail: string;
  /** Default site description (meta description) */
  description: string;
}

const clean = (value: string | undefined, fallback: string): string => {
  const v = typeof value === 'string' ? value.trim() : '';
  return v || fallback;
};

const name = clean(process.env.NEXT_PUBLIC_SITE_NAME, 'Website');

export const brand: Brand = {
  name,
  shortName: clean(process.env.NEXT_PUBLIC_SITE_SHORT_NAME, name),
  url: clean(process.env.NEXT_PUBLIC_SITE_URL, 'http://localhost:3000').replace(/\/+$/, ''),
  contactEmail: clean(process.env.NEXT_PUBLIC_CONTACT_EMAIL, 'contact@example.com'),
  description: clean(process.env.NEXT_PUBLIC_SITE_DESCRIPTION, 'Welcome to our website.'),
};
