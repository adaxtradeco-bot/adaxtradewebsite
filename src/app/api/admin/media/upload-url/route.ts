import { NextRequest, NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { verifyToken } from '@/lib/auth';

export const runtime = 'nodejs';
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as HandleUploadBody;

    try {
      const jsonResponse = await handleUpload({
        body,
        request,
        onBeforeGenerateToken: async (pathname) => {
          // Generate a client token for the upload
          return {
            allowedContentTypes: [
              'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp',
              'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo',
            ],
            tokenPayload: JSON.stringify({
              // Optional: Add user info or metadata
            }),
          };
        },
        onUploadCompleted: async ({ blob, tokenPayload }) => {
          // Optional: Save to database or perform other actions
          console.log('Upload completed:', blob.url);
        },
      });

      return NextResponse.json(jsonResponse);
    } catch (error) {
      console.error('Upload URL generation error:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to generate upload URL' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Request error:', error);
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
