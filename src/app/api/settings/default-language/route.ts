/**
 * Default Language API
 * Returns the default language from site settings.
 */

import { NextResponse } from 'next/server';
import { getSiteDefaultLanguage } from '@/lib/i18n/default-language';

export const dynamic = 'force-dynamic';

export async function GET() {
  const defaultLanguage = await getSiteDefaultLanguage();
  const response = NextResponse.json({ defaultLanguage });
  response.cookies.set('defaultLanguage', defaultLanguage, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365 // 1 year
  });
  return response;
}
