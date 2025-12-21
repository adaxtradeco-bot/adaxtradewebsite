'use client';

import React, { useState, useEffect } from 'react';

interface MediaFile {
  filename: string;
  url: string;
  size: number;
  uploadDate: string;
  type: string;
}

interface MediaBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  acceptTypes?: string[];
}

export function MediaBrowser({ isOpen, onClose, onSelect, acceptTypes = ['image/*'] }: MediaBrowserProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadMediaFiles();
    }
  }, [isOpen]);

  const loadMediaFiles = async () => {
    setLoading(true);
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
    const token = localStorage.getItem('adminToken');

    for (const file of Array.from(fileList)) {
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/admin/media', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData,
        });

        if (response.ok) {
          await loadMediaFiles();
        }
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }
    
    setUploading(false);
    e.target.value = '';
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.filename.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = acceptTypes.some(type => {
      if (type === 'image/*') return file.type?.startsWith('image/');
      if (type === 'video/*') return file.type?.startsWith('video/');
      return file.type === type;
    });
    return matchesSearch && matchesType;
  });

  const handleSelect = () => {
    if (selectedFile) {
      onSelect(selectedFile);
      onClose();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl max-h-[90vh] w-full mx-4 flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Media Library</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Select a file or upload new media
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer font-medium transition-colors text-sm">
              {uploading ? 'Uploading...' : 'Upload'}
              <input
                type="file"
                multiple
                accept={acceptTypes.join(',')}
                onChange={handleUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📁</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchTerm ? 'No files found' : 'No files uploaded yet'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm ? 'Try a different search term' : 'Upload your first file to get started'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredFiles.map((file) => (
                <div
                  key={file.filename}
                  className={`group cursor-pointer rounded-lg border-2 transition-all ${
                    selectedFile === file.url
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                  onClick={() => setSelectedFile(file.url)}
                >
                  <div className="aspect-square rounded-t-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                    {file.type?.startsWith('image/') ? (
                      <img
                        src={file.url}
                        alt={file.filename}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        {file.type?.startsWith('video/') ? '🎥' : '📄'}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={file.filename}>
                      {file.filename}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {selectedFile ? (
              <span>Selected: {filteredFiles.find(f => f.url === selectedFile)?.filename}</span>
            ) : (
              <span>Select a file to continue</span>
            )}
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSelect}
              disabled={!selectedFile}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Select File
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}