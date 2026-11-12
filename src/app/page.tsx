/**
 * Root page redirect
 *
 * Sends "/" to the homepage of the default language chosen in
 * Admin → Site Settings. Rendered on every request (force-dynamic): without it
 * Next.js prerenders this page at build time and the redirect target is frozen
 * to whatever the database held during the build, so changing the default
 * language in settings had no effect until the next deploy.
 */

import { redirect } from 'next/navigation';
import { getSiteDefaultLanguage } from '@/lib/i18n/default-language';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function RootPage() {
  const defaultLanguage = await getSiteDefaultLanguage();
  redirect(`/${defaultLanguage}`);
}
