import { NextRequest, NextResponse } from 'next/server';
import { put, list, del } from '@vercel/blob';
import { verifyToken } from '@/lib/auth';

// GET - List all media files
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { blobs } = await list();
    
    const fileDetails = blobs.map((blob) => ({
      filename: blob.pathname.split('/').pop() || blob.pathname,
      url: blob.url,
      size: blob.size,
      uploadDate: blob.uploadedAt,
      type: getFileType(blob.pathname)
    }));

    // Sort by upload date (newest first)
    fileDetails.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());

    return NextResponse.json({ files: fileDetails });
  } catch (error) {
    console.error('List files error:', error);
    return NextResponse.json({ error: 'Failed to list files' }, { status: 500 });
  }
}

// POST - Upload new file
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const filename = `media/${Date.now()}-${file.name.replace(/\s/g, '-')}`;
    
    const blob = await put(filename, file, {
      access: 'public',
    });

    return NextResponse.json({ 
      url: blob.url,
      filename: blob.pathname,
      size: file.size,
      type: file.type
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

// DELETE - Delete file
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    
    if (!url) {
      return NextResponse.json({ error: 'File URL required' }, { status: 400 });
    }

    await del(url);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}

// Helper function to determine file type
function getFileType(pathname: string): string {
  const ext = pathname.split('.').pop()?.toLowerCase();
  
  if (!ext) return 'application/octet-stream';
  
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
    return 'image/' + ext;
  }
  if (['mp4', 'avi', 'mov', 'wmv'].includes(ext)) {
    return 'video/' + ext;
  }
  if (ext === 'pdf') {
    return 'application/pdf';
  }
  if (['doc', 'docx'].includes(ext)) {
    return 'application/msword';
  }
  
  return 'application/octet-stream';
}
