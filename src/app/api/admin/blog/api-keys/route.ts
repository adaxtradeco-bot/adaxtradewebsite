import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizeSettings } from '@/lib/api-auth';
import { generateApiKey } from '@/lib/blog/api-keys';

export const dynamic = 'force-dynamic';

const select = { id: true, name: true, prefix: true, scopes: true, lastUsedAt: true, revokedAt: true, createdAt: true } as const;

export async function GET(request: NextRequest) {
  const auth = authorizeSettings(request);
  if (!auth.ok) return auth.response;

  const keys = await prisma.apiKey.findMany({ select, orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ keys });
}

// The full key is returned once, here; only its hash is stored.
export async function POST(request: NextRequest) {
  const auth = authorizeSettings(request);
  if (!auth.ok) return auth.response;

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === 'string' ? body.name.trim().slice(0, 100) : '';
  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

  const { key, prefix, hashedKey } = generateApiKey();
  const row = await prisma.apiKey.create({
    data: { name, prefix, hashedKey, createdById: auth.user.id },
    select,
  });
  return NextResponse.json({ key, apiKey: row }, { status: 201 });
}
