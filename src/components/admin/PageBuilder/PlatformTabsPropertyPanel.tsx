/**
 * Platform Tabs Property Panel
 * Author: Amazon Q
 * Created: 2024-01-20
 */
'use client';

import React, { useState } from 'react';
import { SectionConfig } from '@/lib/page-builder/section-schemas';
import { InlineFieldHelper } from './InlineFieldHelper';

interface PlatformTabsPropertyPanelProps {
  section: SectionConfig;
  onUpdate: (updates: Partial<SectionConfig>) => void;
}

export function PlatformTabsPropertyPanel({
  section,
  onUpdate,
}: PlatformTabsPropertyPanelProps) {
  const [data, setData] = useState(section.data);

  const updateData = (newData: any) => {
    setData(newData);
    onUpdate({ data: newData });
  };

  const addTab = () => {
    const newTab = {
      id: `tab-${Date.now()}`,
      label: 'New Tab',
      cards: [],
    };
    updateData({ ...data, tabs: [...(data.tabs || []), newTab] });
  };

  const removeTab = (index: number) => {
    const newTabs = (data.tabs || []).filter((_: any, i: number) => i !== index);
    updateData({ ...data, tabs: newTabs });
  };

  return (
    <div className="space-y-4">
      {/* Header Fields */}
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
          Subtitle
        </label>
        <input
          type="text"
          value={data.subtitle || ''}
          onChange={(e) => updateData({ ...data, subtitle: e.target.value })}
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

      {/* Tabs */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
            Tabs ({(data.tabs || []).length})
          </h4>
          <button
            onClick={addTab}
            className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
          >
            + Add Tab
          </button>
        </div>

        <div className="space-y-3 max-h-80 overflow-y-auto">
          {(data.tabs || []).map((tab: any, index: number) => (
            <div
              key={index}
              className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Tab {index + 1}: {tab.label}
                </span>
                <button
                  onClick={() => removeTab(index)}
                  className="text-red-600 hover:text-red-700 text-xs"
                >
                  🗑️ Remove
                </button>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tab Label
                  </label>
                  <input
                    type="text"
                    value={tab.label || ''}
                    onChange={(e) => {
                      const newTabs = [...(data.tabs || [])];
                      newTabs[index] = { ...newTabs[index], label: e.target.value };
                      updateData({ ...data, tabs: newTabs });
                    }}
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="text-xs text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                  <p className="font-semibold mb-1">💡 Cards Configuration:</p>
                  <p>Each tab contains cards with:</p>
                  <ul className="ml-4 list-disc mt-1">
                    <li><code>title</code> - Card title</li>
                    <li><code>description</code> - Card text</li>
                    <li><code>image</code> - Card image URL</li>
                    <li><code>link</code> - "Explore" button URL</li>
                  </ul>
                  <p className="mt-2">Use <strong>JSON Editor</strong> to add/edit cards</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
