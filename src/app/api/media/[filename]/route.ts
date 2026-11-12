import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import { getUploadContentType, resolveUploadPath, uploadSecurityHeaders } from '@/lib/upload-files';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filepath = resolveUploadPath(params.filename);
    const stats = filepath ? await stat(filepath).catch(() => null) : null;

    if (!filepath || !stats?.isFile()) {
      return new NextResponse('File not found', { status: 404 });
    }

    const fileBuffer = await readFile(filepath);
    const contentType = getUploadContentType(filepath);

    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        'Content-Type': contentType,
        'Content-Length': stats.size.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        ...uploadSecurityHeaders(contentType),
      }
    });
  } catch (error) {
    console.error('File serve error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
