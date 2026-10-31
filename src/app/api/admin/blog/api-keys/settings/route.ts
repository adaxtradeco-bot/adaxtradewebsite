import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizeSettings } from '@/lib/api-auth';
import { getApiCanPublish } from '@/lib/blog/api-keys';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = authorizeSettings(request);
  if (!auth.ok) return auth.response;
  return NextResponse.json({ apiCanPublish: await getApiCanPublish() });
}

// Stores `blog.apiCanPublish` inside SiteSettings.data, leaving the rest of the settings untouched.
export async function PUT(request: NextRequest) {
  const auth = authorizeSettings(request);
  if (!auth.ok) return auth.response;

  const body = await request.json().catch(() => null);
  if (typeof body?.apiCanPublish !== 'boolean') {
    return NextResponse.json({ error: 'apiCanPublish must be a boolean' }, { status: 400 });
  }

  const existing = await prisma.siteSettings.findFirst();
  const data = JSON.parse(existing?.data ?? '{}');
  data.blog = { ...data.blog, apiCanPublish: body.apiCanPublish };

  if (existing) {
    await prisma.siteSettings.update({ where: { id: existing.id }, data: { data: JSON.stringify(data) } });
  } else {
    await prisma.siteSettings.create({ data: { data: JSON.stringify(data) } });
  }
  return NextResponse.json({ apiCanPublish: body.apiCanPublish });
}
