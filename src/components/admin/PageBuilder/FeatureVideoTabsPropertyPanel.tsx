/**
 * Feature Video Tabs Property Panel
 * Author: Amazon Q
 * Created: 2024-01-20
 */
'use client';

import React, { useState } from 'react';
import { SectionConfig } from '@/lib/page-builder/section-schemas';
import { InlineFieldHelper } from './InlineFieldHelper';

interface FeatureVideoTabsPropertyPanelProps {
  section: SectionConfig;
  onUpdate: (updates: Partial<SectionConfig>) => void;
}

export function FeatureVideoTabsPropertyPanel({
  section,
  onUpdate,
}: FeatureVideoTabsPropertyPanelProps) {
  const [data, setData] = useState(section.data);

  const updateData = (newData: any) => {
    setData(newData);
    onUpdate({ data: newData });
  };

  return (
    <div className="space-y-4">
      {/* Header Fields */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Eyebrow
        </label>
        <input
          type="text"
          value={data.eyebrow || ''}
          onChange={(e) => updateData({ ...data, eyebrow: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Title
        </label>
        <input
          type="text"
          value={data.title || ''}
          onChange={(e) => updateData({ ...data, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description
        </label>
        <textarea
          value={data.description || ''}
          onChange={(e) => updateData({ ...data, description: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        />
      </div>

      {/* Video Settings */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Video Settings
        </h4>

        <div className="space-y-3">
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Autoplay
              <InlineFieldHelper
                label="Autoplay"
                description="Automatically play video when visible"
                values={[
                  { value: 'true', label: 'Enabled - Auto play on scroll' },
                  { value: 'false', label: 'Disabled - Manual play only' },
                ]}
              />
            </label>
            <select
              value={String(data.autoplay ?? true)}
              onChange={(e) => updateData({ ...data, autoplay: e.target.value === 'true' })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Show Fullscreen Button
              <InlineFieldHelper
                label="Fullscreen Button"
                description="Show fullscreen toggle button"
                values={[
                  { value: 'true', label: 'Show button' },
                  { value: 'false', label: 'Hide button' },
                ]}
              />
            </label>
            <select
              value={String(data.showFullscreenButton ?? true)}
              onChange={(e) => updateData({ ...data, showFullscreenButton: e.target.value === 'true' })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="true">Show</option>
              <option value="false">Hide</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Max Width
            </label>
            <input
              type="text"
              value={data.maxWidth || '1920px'}
              onChange={(e) => updateData({ ...data, maxWidth: e.target.value })}
              placeholder="1920px"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Padding Y
            </label>
            <input
              type="text"
              value={data.paddingY || '0'}
              onChange={(e) => updateData({ ...data, paddingY: e.target.value })}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Padding X
            </label>
            <input
              type="text"
              value={data.paddingX || '0'}
              onChange={(e) => updateData({ ...data, paddingX: e.target.value })}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>
        </div>
      </div>

      {/* Tabs Info */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Video Tabs ({(data.tabs || []).length})
        </h4>
        <div className="text-xs text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
          <p className="font-semibold mb-2">💡 Tab Configuration:</p>
          <ul className="space-y-1 ml-4 list-disc">
            <li><code>videoSrc</code> - Main video URL (required)</li>
            <li><code>videoSrcMobile</code> - Mobile video (optional)</li>
            <li><code>icon</code> - Tab icon image URL</li>
            <li><code>title</code> - Tab label text</li>
          </ul>
          <p className="mt-2">Use <strong>JSON Editor</strong> to configure tabs</p>
        </div>
      </div>
    </div>
  );
}
