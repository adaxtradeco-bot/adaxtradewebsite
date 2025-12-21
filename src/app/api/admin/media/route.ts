import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readdir, stat, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { verifyToken } from '@/lib/auth';

// GET - List all media files
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    if (!existsSync(uploadDir)) {
      return NextResponse.json({ files: [] });
    }

    const files = await readdir(uploadDir);
    const fileDetails = await Promise.all(
      files.map(async (filename) => {
        const filepath = path.join(uploadDir, filename);
        const stats = await stat(filepath);
        
        return {
          filename,
          url: `/api/media/${filename}`,
          size: stats.size,
          uploadDate: stats.birthtime.toISOString(),
          type: getFileType(filename)
        };
      })
    );

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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const filename = `${Date.now()}-${file.name.replace(/\s/g, '-')}`;
    const filepath = path.join(uploadDir, filename);
    
    await writeFile(filepath, buffer);

    return NextResponse.json({ 
      url: `/api/media/${filename}`,
      filename,
      size: buffer.length,
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
    const filename = searchParams.get('filename');
    
    if (!filename) {
      return NextResponse.json({ error: 'Filename required' }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const filepath = path.join(uploadDir, filename);
    
    if (!existsSync(filepath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    await unlink(filepath);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}

// Helper function to determine file type
function getFileType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  
  if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext)) {
    return 'image/' + ext.slice(1);
  }
  if (['.mp4', '.avi', '.mov', '.wmv'].includes(ext)) {
    return 'video/' + ext.slice(1);
  }
  if (ext === '.pdf') {
    return 'application/pdf';
  }
  if (['.doc', '.docx'].includes(ext)) {
    return 'application/msword';
  }
  
  return 'application/octet-stream';
}
