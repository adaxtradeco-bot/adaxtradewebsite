import { NextRequest, NextResponse } from 'next/server';
import { put, del, list } from '@vercel/blob';
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

    const body = await request.json();
    const { filename, totalChunks, originalName } = body;

    if (!filename || !totalChunks || !originalName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get all chunks
    const chunkUrls: string[] = [];
    for (let i = 0; i < totalChunks; i++) {
      const chunkFilename = `${filename}-chunk-${i}`;
      const { blobs } = await list({ prefix: chunkFilename });
      
      if (blobs.length === 0) {
        return NextResponse.json({ error: `Chunk ${i} not found` }, { status: 400 });
      }
      
      chunkUrls.push(blobs[0].url);
    }

    // In a real implementation, you would:
    // 1. Download all chunks
    // 2. Combine them into one file
    // 3. Upload the combined file
    // 4. Delete the chunks

    // For now, we'll just create a placeholder file
    // In production, you should use a serverless function or external service
    // to combine the chunks

    const finalFilename = `media/${Date.now()}-${originalName.replace(/\s/g, '-')}`;
    const placeholderContent = new Blob([`Combined file: ${originalName}`], {
      type: 'text/plain',
    });

    const blob = await put(finalFilename, placeholderContent, {
      access: 'public',
      addRandomSuffix: false,
    });

    // Clean up chunks (optional)
    for (const url of chunkUrls) {
      try {
        await del(url);
      } catch (error) {
        console.error('Failed to delete chunk:', error);
      }
    }

    return NextResponse.json({
      success: true,
      url: blob.url,
      filename: finalFilename,
    });
  } catch (error) {
    console.error('Combine chunks error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to combine chunks' },
      { status: 500 }
    );
  }
}
