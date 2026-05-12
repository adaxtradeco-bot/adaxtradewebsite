import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { verifyToken } from '@/lib/auth';

export const runtime = 'nodejs';
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const chunk = formData.get('chunk') as File;
    const filename = formData.get('filename') as string;
    const chunkIndex = formData.get('chunkIndex') as string;
    const totalChunks = formData.get('totalChunks') as string;

    if (!chunk || !filename || !chunkIndex || !totalChunks) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Upload chunk to Vercel Blob
    const blob = await put(filename, chunk, {
      access: 'public',
      addRandomSuffix: false,
    });

    return NextResponse.json({
      success: true,
      chunkIndex: parseInt(chunkIndex),
      totalChunks: parseInt(totalChunks),
      url: blob.url,
    });
  } catch (error) {
    console.error('Chunk upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Chunk upload failed' },
      { status: 500 }
    );
  }
}
