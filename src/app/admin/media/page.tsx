'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface MediaFile {
  filename: string;
  url: string;
  size: number;
  uploadDate: string;
  type: string;
}

export default function MediaPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');
  const [uploadSuccess, setUploadSuccess] = useState<string>('');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const router = useRouter();

  useEffect(() => {
    loadMediaFiles();
  }, []);

  const loadMediaFiles = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/media', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFiles(data.files || []);
      }
    } catch (error) {
      console.error('Failed to load media files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;

    setUploading(true);
    setUploadError('');
    setUploadSuccess('');
    const token = localStorage.getItem('adminToken');

    for (const file of Array.from(fileList)) {
      try {
        // Client-side validation
        const maxSize = file.type.startsWith('video/') ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
        if (file.size > maxSize) {
          const maxSizeText = file.type.startsWith('video/') ? '50MB' : '10MB';
          setUploadError(`File "${file.name}" is too large (max ${maxSizeText})`);
          continue;
        }

        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/admin/media', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData,
        });

        const data = await response.json();

        if (response.ok) {
          setUploadSuccess(`File "${file.name}" uploaded successfully!`);
          await loadMediaFiles();
        } else {
          setUploadError(data.error || `Failed to upload "${file.name}"`);
        }
      } catch (error) {
        console.error('Upload failed:', error);
        setUploadError(`Failed to upload "${file.name}": ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    setUploading(false);
    e.target.value = '';
    
    // Clear messages after 5 seconds
    setTimeout(() => {
      setUploadError('');
      setUploadSuccess('');
    }, 5000);
  };

  const handleDelete = async (filename: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/media?filename=${filename}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        await loadMediaFiles();
        setSelectedFiles(prev => prev.filter(f => f !== filename));
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    // Show toast notification
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) return '🖼️';
    if (['mp4', 'avi', 'mov', 'wmv'].includes(ext || '')) return '🎥';
    if (['pdf'].includes(ext || '')) return '📄';
    if (['doc', 'docx'].includes(ext || '')) return '📝';
    return '📁';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Media Library</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your uploaded files and media</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* View Mode Toggle */}
          <div className="flex rounded-lg border border-gray-300 dark:border-gray-600">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 text-sm font-medium rounded-l-lg ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
            >
              🔲 Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm font-medium rounded-r-lg ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
            >
              📋 List
            </button>
          </div>

          {/* Upload Button */}
          <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer font-medium transition-colors">
            {uploading ? '⏳ Uploading...' : '📤 Upload Files'}
            <input
              type="file"
              multiple
              accept="image/*,video/*,.gif,.mp4,.webm,.ogg,.mov,.avi,.pdf,.doc,.docx"
              onChange={handleUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {/* Error/Success Messages */}
      {uploadError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-500 mr-3">❌</div>
            <p className="text-red-700 dark:text-red-300">{uploadError}</p>
          </div>
        </div>
      )}
      
      {uploadSuccess && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-green-500 mr-3">✅</div>
            <p className="text-green-700 dark:text-green-300">{uploadSuccess}</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="text-2xl mr-3">📁</div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Files</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{files.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="text-2xl mr-3">🖼️</div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Images</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {files.filter(f => f.type?.startsWith('image/')).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="text-2xl mr-3">💾</div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Size</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatFileSize(files.reduce((acc, f) => acc + (f.size || 0), 0))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Files Display */}
      {files.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📁</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No files uploaded yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Upload your first file to get started</p>
          <label className="inline-flex px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer font-medium transition-colors">
            📤 Upload Files
            <input
              type="file"
              multiple
              accept="image/*,video/*,.gif,.mp4,.webm,.ogg,.mov,.avi,.pdf,.doc,.docx"
              onChange={handleUpload}
              className="hidden"
            />
          </label>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-6">
              {files.map((file) => (
                <div key={file.filename} className="group relative">
                  <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                    {file.type?.startsWith('image/') ? (
                      <img
                        src={file.url}
                        alt={file.filename}
                        className="w-full h-full object-cover"
                      />
                    ) : file.type?.startsWith('video/') ? (
                      <div className="relative w-full h-full">
                        <video
                          src={file.url}
                          className="w-full h-full object-cover"
                          preload="metadata"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                          <div className="text-white text-4xl">▶️</div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        {getFileIcon(file.filename)}
                      </div>
                    )}
                  </div>
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => copyToClipboard(file.url)}
                        className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                        title="Copy URL"
                      >
                        📋
                      </button>
                      <button
                        onClick={() => handleDelete(file.filename)}
                        className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  <p className="mt-2 text-sm text-gray-900 dark:text-white truncate" title={file.filename}>
                    {file.filename}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {files.map((file) => (
                <div key={file.filename} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">{getFileIcon(file.filename)}</div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{file.filename}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatFileSize(file.size || 0)} • {file.uploadDate || 'Unknown date'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => copyToClipboard(file.url)}
                        className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                      >
                        📋 Copy URL
                      </button>
                      <button
                        onClick={() => handleDelete(file.filename)}
                        className="px-3 py-1 text-sm bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}