/**
 * Upload Helper for Large Files
 * Uses chunked upload to bypass server body size limits
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

    // For files larger than 5MB, use chunked upload
    if (file.size > 5 * 1024 * 1024) {
      return await chunkedUpload(file, token, onProgress);
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

async function chunkedUpload(
  file: File,
  token: string,
  onProgress?: (progress: number) => void
): Promise<{ url: string; error?: string }> {
  try {
    // Create a simple chunked upload by splitting the file
    const chunkSize = 2 * 1024 * 1024; // 2MB chunks
    const totalChunks = Math.ceil(file.size / chunkSize);
    let uploadedChunks = 0;

    // Create a unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const baseFilename = `media/${timestamp}-${file.name.replace(/\s/g, '-')}`;

    // Upload each chunk
    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);

      const formData = new FormData();
      formData.append('chunk', chunk);
      formData.append('filename', `${baseFilename}-chunk-${i}`);
      formData.append('totalChunks', totalChunks.toString());
      formData.append('chunkIndex', i.toString());
      formData.append('originalName', file.name);

      const response = await fetch('/api/admin/media/chunk', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Chunk ${i + 1} upload failed`);
      }

      uploadedChunks++;
      if (onProgress) {
        onProgress(Math.round((uploadedChunks / totalChunks) * 100));
      }
    }

    // Combine chunks
    const combineResponse = await fetch('/api/admin/media/combine', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename: baseFilename,
        totalChunks,
        originalName: file.name,
      }),
    });

    if (!combineResponse.ok) {
      const errorData = await combineResponse.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to combine chunks');
    }

    const data = await combineResponse.json();
    return { url: data.url };
  } catch (error) {
    console.error('Chunked upload error:', error);
    throw error;
  }
}
