/**
 * Fusion Teams Tabs Property Panel
 * Author: Amazon Q
 * Created: 2024-01-20
 */
'use client';

import React, { useState } from 'react';
import { SectionConfig } from '@/lib/page-builder/section-schemas';
import { InlineFieldHelper } from './InlineFieldHelper';

interface FusionTeamsTabsPropertyPanelProps {
  section: SectionConfig;
  onUpdate: (updates: Partial<SectionConfig>) => void;
}

export function FusionTeamsTabsPropertyPanel({
  section,
  onUpdate,
}: FusionTeamsTabsPropertyPanelProps) {
  const [data, setData] = useState(section.data);

  const updateData = (newData: any) => {
    setData(newData);
    onUpdate({ data: newData });
  };

  const updateTab = (index: number, updates: any) => {
    const newTabs = [...(data.tabs || [])];
    newTabs[index] = { ...newTabs[index], ...updates };
    updateData({ ...data, tabs: newTabs });
  };

  const toggleTabEnabled = (index: number) => {
    const newTabs = [...(data.tabs || [])];
    newTabs[index].enabled = !newTabs[index].enabled;
    updateData({ ...data, tabs: newTabs });
  };

  return (
    <div className="space-y-4">
      {/* Header Fields */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Main Title
        </label>
        <input
          type="text"
          value={data.mainTitle || ''}
          onChange={(e) => updateData({ ...data, mainTitle: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Main Description
        </label>
        <textarea
          value={data.mainDescription || ''}
          onChange={(e) => updateData({ ...data, mainDescription: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Trusted By Text
        </label>
        <input
          type="text"
          value={data.trustedByText || ''}
          onChange={(e) => updateData({ ...data, trustedByText: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        />
      </div>

      {/* Tabs */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Tabs ({(data.tabs || []).length})
        </h4>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {(data.tabs || []).map((tab: any, index: number) => (
            <div
              key={index}
              className={`p-3 border rounded-lg ${
                tab.enabled
                  ? 'border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Tab {index + 1}: {tab.title}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleTabEnabled(index)}
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      tab.enabled
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-400 text-white hover:bg-gray-500'
                    }`}
                  >
                    {tab.enabled ? '✓ Enabled' : '✗ Disabled'}
                  </button>
                  <InlineFieldHelper
                    label="Tab Enabled/Disabled"
                    description="Control tab visibility"
                    values={[
                      { value: 'true', label: 'Enabled - Tab is visible' },
                      { value: 'false', label: 'Disabled - Tab is hidden' },
                    ]}
                    note="Disabled tabs are completely hidden from users"
                  />
                </div>
              </div>

              {tab.enabled && (
                <div className="space-y-2 mt-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={tab.title || ''}
                      onChange={(e) => updateTab(index, { title: e.target.value })}
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Subtitle
                    </label>
                    <input
                      type="text"
                      value={tab.subtitle || ''}
                      onChange={(e) => updateTab(index, { subtitle: e.target.value })}
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="text-xs text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                    💡 Use <strong>JSON Editor</strong> to edit description, benefits, images
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
