/**
 * Upload Helper for Large Files
 * Uses client-side upload to bypass server body size limits
 */

export async function uploadLargeFile(
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ url: string; error?: string }> {
  try {
    // Get auth token
    const token = localStorage.getItem('adminToken');
    if (!token) {
      throw new Error('Authentication required');
    }

    // For files larger than 4MB, use client-side upload
    if (file.size > 4 * 1024 * 1024) {
      return await clientSideUpload(file, token, onProgress);
    }

    // For smaller files, use regular server upload
    return await serverSideUpload(file, token, onProgress);
  } catch (error) {
    console.error('Upload error:', error);
    return {
      url: '',
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

async function serverSideUpload(
  file: File,
  token: string,
  onProgress?: (progress: number) => void
): Promise<{ url: string; error?: string }> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const percentComplete = Math.round((e.loaded / e.total) * 100);
        onProgress(percentComplete);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve({ url: data.url });
        } catch (e) {
          reject(new Error('Invalid response from server'));
        }
      } else {
        try {
          const data = JSON.parse(xhr.responseText);
          reject(new Error(data.error || `Upload failed with status ${xhr.status}`));
        } catch (e) {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error occurred'));
    });

    xhr.addEventListener('timeout', () => {
      reject(new Error('Upload timeout'));
    });

    xhr.open('POST', '/api/admin/media');
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.timeout = 120000;
    xhr.send(formData);
  });
}

async function clientSideUpload(
  file: File,
  token: string,
  onProgress?: (progress: number) => void
): Promise<{ url: string; error?: string }> {
  try {
    // Import the upload function from @vercel/blob/client
    const { upload } = await import('@vercel/blob/client');

    const blob = await upload(file.name, file, {
      access: 'public',
      handleUploadUrl: '/api/admin/media/upload-url',
      clientPayload: JSON.stringify({ token }),
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.percentage) {
          onProgress(Math.round(progressEvent.percentage));
        }
      },
    });

    return { url: blob.url };
  } catch (error) {
    console.error('Client-side upload error:', error);
    throw error;
  }
}
