/**
 * Section Preview Modal
 * Shows a beautiful preview of a section before adding it to the page
 */

'use client';

import React, { useState } from 'react';
import { X, Monitor, Tablet, Smartphone, Sun, Moon, Plus } from 'lucide-react';
import { PreviewDevice, PreviewTheme, PreviewModalProps } from '@/types/section-preview';
import { ResponsivePreview } from './ResponsivePreview';
import { SectionRenderer } from '@/lib/page-builder/section-renderer';

export function SectionPreviewModal({
  isOpen,
  sectionType,
  sectionName,
  sectionDescription,
  sampleData,
  onClose,
  onAddSection,
}: PreviewModalProps) {
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const [theme, setTheme] = useState<PreviewTheme>('light');

  if (!isOpen) return null;

  const handleAddSection = () => {
    onAddSection();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full h-full max-w-7xl max-h-[90vh] m-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <span className="text-3xl">{sampleData.type === 'hero' ? '🎯' : sampleData.type === 'hero-slider' ? '🎞️' : sampleData.type === 'features' ? '⭐' : sampleData.type === 'tabs' ? '📑' : sampleData.type === 'logo-cloud' ? '🏢' : '🎨'}</span>
              {sectionName}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {sectionDescription}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Device Toggle */}
            <div className="flex items-center gap-1 bg-white dark:bg-gray-700 rounded-lg p-1 shadow-sm">
              <button
                onClick={() => setDevice('desktop')}
                className={`p-2 rounded transition-colors ${
                  device === 'desktop'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
                title="Desktop View"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDevice('tablet')}
                className={`p-2 rounded transition-colors ${
                  device === 'tablet'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
                title="Tablet View"
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDevice('mobile')}
                className={`p-2 rounded transition-colors ${
                  device === 'mobile'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
                title="Mobile View"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>

            {/* Theme Toggle */}
            <div className="flex items-center gap-1 bg-white dark:bg-gray-700 rounded-lg p-1 shadow-sm">
              <button
                onClick={() => setTheme('light')}
                className={`p-2 rounded transition-colors ${
                  theme === 'light'
                    ? 'bg-yellow-500 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
                title="Light Theme"
              >
                <Sun className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`p-2 rounded transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
                title="Dark Theme"
              >
                <Moon className="w-4 h-4" />
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preview Area */}
        <div className={`flex-1 overflow-hidden ${theme === 'dark' ? 'dark' : ''}`}>
          <ResponsivePreview device={device}>
            <SectionRenderer section={sampleData} isPreview={true} />
          </ResponsivePreview>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">Preview Mode:</span>
            <span className="capitalize">{device}</span>
            <span>•</span>
            <span className="capitalize">{theme}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleAddSection}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all font-medium shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add to Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
