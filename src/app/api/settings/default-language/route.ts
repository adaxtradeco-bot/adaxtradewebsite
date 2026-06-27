/**
 * Default Language API
 * Returns the default language from site settings
 * Used by middleware for initial redirects
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const settings = await prisma.siteSettings.findFirst();
    
    let defaultLanguage = 'fa';
    
    if (settings) {
      const saved = JSON.parse(settings.data);
      defaultLanguage = saved?.languages?.defaultLanguage || 'fa';
    }

    const response = NextResponse.json({ defaultLanguage });
    response.cookies.set('defaultLanguage', defaultLanguage, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365 // 1 year
    });
    
    return response;
  } catch (error) {
    console.error('Failed to fetch default language:', error);
    const response = NextResponse.json({ defaultLanguage: 'fa' });
    response.cookies.set('defaultLanguage', 'fa', {
      path: '/',
      maxAge: 60 * 60 * 24 * 365
    });
    return response;
  }
}
