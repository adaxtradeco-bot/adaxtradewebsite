import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizeSettings } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

// Revokes the key (kept in the list for audit); a revoked key can no longer authenticate.
async function revoke(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = authorizeSettings(request);
  if (!auth.ok) return auth.response;

  const key = await prisma.apiKey.findUnique({ where: { id: params.id }, select: { id: true } });
  if (!key) return NextResponse.json({ error: 'API key not found' }, { status: 404 });

  await prisma.apiKey.update({ where: { id: params.id }, data: { revokedAt: new Date() } });
  return NextResponse.json({ success: true });
}

export const DELETE = revoke;
export const POST = revoke;
