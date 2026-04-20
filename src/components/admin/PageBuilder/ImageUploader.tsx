/**
 * Image Uploader Component with Advanced Settings
 * Author: Amazon Q
 * Created: 2025-01-XX
 * 
 * Purpose: Reusable image/video uploader with MediaBrowser integration
 * Features: Upload, Browse, URL input, Advanced settings (objectFit, maxWidth, maxHeight, alt)
 */

'use client';

import React from 'react';
import { MediaBrowser } from './MediaBrowser';

interface ImageUploaderProps {
  value: string | ImageSettings;
  onChange: (value: string | ImageSettings, settings?: ImageSettings) => void;
  field?: string;
  onSettingsChange?: (settings: ImageSettings) => void;
  acceptTypes?: string[];
}

export interface ImageSettings {
  src?: string;
  alt?: string;
  maxWidth?: string | null;
  maxHeight?: string | null;
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none';
  type?: 'image' | 'video';
}

export function ImageUploader({ 
  value, 
  onChange, 
  field, 
  onSettingsChange,
  acceptTypes = ['image/*', 'video/*']
}: ImageUploaderProps) {
  const [uploading, setUploading] = React.useState(false);
  const [showMediaBrowser, setShowMediaBrowser] = React.useState(false);
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [imageSettings, setImageSettings] = React.useState<ImageSettings>({
    alt: '',
    maxWidth: '',
    maxHeight: '',
    objectFit: 'cover',
    type: 'image'
  });

  // Extract existing settings if they exist
  React.useEffect(() => {
    if (typeof value === 'object' && value !== null && value.src) {
      setImageSettings({
        alt: value.alt || '',
        maxWidth: value.maxWidth || '',
        maxHeight: value.maxHeight || '',
        objectFit: value.objectFit || 'cover',
        type: value.type || 'image'
      });
    }
  }, [value]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const token = localStorage.getItem('adminToken');

      const response = await fetch('/api/admin/media', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        onChange(data.url);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const currentValue = typeof value === 'object' && value !== null && value.src ? value.src : value;
  const isImageObject = typeof value === 'object' && value !== null && value.src;
  const isVideo = typeof currentValue === 'string' && currentValue && (
    currentValue.match(/\.(mp4|webm|mov)$/i) || 
    (typeof value === 'object' && value.type === 'video')
  );

  return (
    <>
      <div className="space-y-2">
        {currentValue && typeof currentValue === 'string' && (
          <div className="relative w-full h-32 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
            {isVideo ? (
              <video 
                src={currentValue} 
                className={`w-full h-full object-${imageSettings.objectFit}`}
                style={{
                  maxWidth: imageSettings.maxWidth ? `${imageSettings.maxWidth}px` : undefined,
                  maxHeight: imageSettings.maxHeight ? `${imageSettings.maxHeight}px` : undefined
                }}
                controls
              />
            ) : (
              <img 
                src={currentValue} 
                alt="Preview" 
                className={`w-full h-full object-${imageSettings.objectFit}`}
                style={{
                  maxWidth: imageSettings.maxWidth ? `${imageSettings.maxWidth}px` : undefined,
                  maxHeight: imageSettings.maxHeight ? `${imageSettings.maxHeight}px` : undefined
                }}
              />
            )}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onChange('');
              }}
              className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 text-xs"
              title="Remove media"
            >
              ✕
            </button>
          </div>
        )}
        
        <div className="flex gap-2">
          <input
            type="text"
            value={typeof currentValue === 'string' ? currentValue : ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Media URL or path"
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          />
          
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowMediaBrowser(true);
            }}
            className="px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm font-medium whitespace-nowrap"
          >
            📚 Browse
          </button>
          
          <label className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer text-sm font-medium whitespace-nowrap">
            {uploading ? '⏳' : '📤'} Upload
            <input 
              type="file" 
              accept={acceptTypes.join(',')} 
              onChange={handleUpload} 
              className="hidden" 
              disabled={uploading} 
            />
          </label>
        </div>

        {currentValue && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowAdvanced(!showAdvanced);
            }}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            {showAdvanced ? '🔽 Hide' : '🔧 Show'} Advanced Settings {isImageObject ? '(Applied)' : ''}
          </button>
        )}
        
        {showAdvanced && currentValue && (
          <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-md border">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Max Width (px)
                </label>
                <input
                  type="number"
                  value={imageSettings.maxWidth || ''}
                  onChange={(e) => setImageSettings(prev => ({ ...prev, maxWidth: e.target.value }))}
                  placeholder="Auto"
                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Max Height (px)
                </label>
                <input
                  type="number"
                  value={imageSettings.maxHeight || ''}
                  onChange={(e) => setImageSettings(prev => ({ ...prev, maxHeight: e.target.value }))}
                  placeholder="Auto"
                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Object Fit
              </label>
              <select
                value={imageSettings.objectFit}
                onChange={(e) => setImageSettings(prev => ({ ...prev, objectFit: e.target.value as any }))}
                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="cover">Cover (crop to fill)</option>
                <option value="contain">Contain (fit inside)</option>
                <option value="fill">Fill (stretch to fill)</option>
                <option value="scale-down">Scale Down (smaller of contain/none)</option>
                <option value="none">None (original size)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Alt Text
              </label>
              <input
                type="text"
                value={imageSettings.alt || ''}
                onChange={(e) => setImageSettings(prev => ({ ...prev, alt: e.target.value }))}
                placeholder="Describe the media for accessibility"
                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Media Type
              </label>
              <select
                value={imageSettings.type}
                onChange={(e) => setImageSettings(prev => ({ ...prev, type: e.target.value as 'image' | 'video' }))}
                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
            </div>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const newImageObject: ImageSettings = {
                    src: typeof currentValue === 'string' ? currentValue : '',
                    alt: imageSettings.alt || '',
                    maxWidth: imageSettings.maxWidth || null,
                    maxHeight: imageSettings.maxHeight || null,
                    objectFit: imageSettings.objectFit || 'cover',
                    type: imageSettings.type || 'image'
                  };
                  onChange(newImageObject, imageSettings);
                  onSettingsChange?.(imageSettings);
                }}
                className="flex-1 px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
              >
                ✓ Apply Settings
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setImageSettings({ alt: '', maxWidth: '', maxHeight: '', objectFit: 'cover', type: 'image' });
                }}
                className="px-2 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700"
              >
                Reset
              </button>
            </div>
          </div>
        )}
      </div>

      <MediaBrowser
        isOpen={showMediaBrowser}
        onClose={() => setShowMediaBrowser(false)}
        onSelect={(url) => {
          onChange(url);
          setShowMediaBrowser(false);
        }}
        acceptTypes={acceptTypes}
      />
    </>
  );
}
