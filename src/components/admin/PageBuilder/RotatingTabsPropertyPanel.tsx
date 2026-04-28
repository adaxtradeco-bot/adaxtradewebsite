/**
 * Rotating Tabs Property Panel
 * Author: Amazon Q
 * Created: 2024-01-20
 */
'use client';

import React, { useState } from 'react';
import { SectionConfig } from '@/lib/page-builder/section-schemas';
import { InlineFieldHelper } from './InlineFieldHelper';
import { INFOGRAPHIC_DEFAULT_DATA, INFOGRAPHIC_TYPE_OPTIONS, getInfographicStructurePreview } from '@/lib/page-builder/infographic-defaults';
import { ImageUploader } from './ImageUploader';
import InfographicFieldEditor from './InfographicFieldEditor';

interface RotatingTabsPropertyPanelProps {
  section: SectionConfig;
  onUpdate: (updates: Partial<SectionConfig>) => void;
}

const INFOGRAPHIC_TYPES = INFOGRAPHIC_TYPE_OPTIONS;

export function RotatingTabsPropertyPanel({ section, onUpdate }: RotatingTabsPropertyPanelProps) {
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

  const updateTabContent = (tabIndex: number, contentUpdates: any) => {
    const newTabs = [...(data.tabs || [])];
    newTabs[tabIndex] = {
      ...newTabs[tabIndex],
      content: { ...newTabs[tabIndex].content, ...contentUpdates },
    };
    updateData({ ...data, tabs: newTabs });
  };

  const addTab = () => {
    const newTab = {
      tag: 'New Tab',
      title: 'Tab Title',
      description: 'Tab description',
      content: {
        tag: 'Content Tag',
        title: 'Content Title',
        lead: 'Content lead text',
        example: 'Example usage',
      },
    };
    updateData({ ...data, tabs: [...(data.tabs || []), newTab] });
  };

  const removeTab = (index: number) => {
    const newTabs = (data.tabs || []).filter((_: any, i: number) => i !== index);
    updateData({ ...data, tabs: newTabs });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Eyebrow</label>
        <input
          type="text"
          value={data.eyebrow || ''}
          onChange={(e) => updateData({ ...data, eyebrow: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title</label>
        <input
          type="text"
          value={data.title || ''}
          onChange={(e) => updateData({ ...data, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Highlighted Title</label>
        <input
          type="text"
          value={data.highlightedTitle || ''}
          onChange={(e) => updateData({ ...data, highlightedTitle: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Lead Text</label>
        <textarea
          value={data.lead || ''}
          onChange={(e) => updateData({ ...data, lead: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        />
      </div>

      {/* Auto Rotate */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="autoRotate"
          checked={data.autoRotate !== false}
          onChange={(e) => updateData({ ...data, autoRotate: e.target.checked })}
          className="rounded"
        />
        <label htmlFor="autoRotate" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Auto Rotate Tabs
        </label>
      </div>

      {data.autoRotate !== false && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Rotate Interval (ms)
          </label>
          <input
            type="number"
            value={data.rotateInterval || 4000}
            onChange={(e) => updateData({ ...data, rotateInterval: Number(e.target.value) })}
            min={1000}
            step={500}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          />
        </div>
      )}

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

        <div className="space-y-4 max-h-[600px] overflow-y-auto">
          {(data.tabs || []).map((tab: any, index: number) => (
            <div
              key={index}
              className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Tab {index + 1}: {tab.title}
                </span>
                <button onClick={() => removeTab(index)} className="text-red-600 hover:text-red-700 text-xs">
                  🗑️ Remove
                </button>
              </div>

              {/* Tab Pill Fields */}
              <div className="space-y-2 mb-3">
                <div className="text-[10px] font-semibold uppercase text-gray-500 tracking-wider">Tab Pill</div>
                <input
                  type="text"
                  placeholder="Tag"
                  value={tab.tag || ''}
                  onChange={(e) => updateTab(index, { tag: e.target.value })}
                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Title"
                  value={tab.title || ''}
                  onChange={(e) => updateTab(index, { title: e.target.value })}
                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                <textarea
                  placeholder="Description"
                  value={tab.description || ''}
                  onChange={(e) => updateTab(index, { description: e.target.value })}
                  rows={2}
                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              {/* Tab Content Fields */}
              <div className="space-y-2 border-t border-gray-300 dark:border-gray-600 pt-2">
                <div className="text-[10px] font-semibold uppercase text-gray-500 tracking-wider">Content Panel</div>
                <input
                  type="text"
                  placeholder="Content Tag"
                  value={tab.content?.tag || ''}
                  onChange={(e) => updateTabContent(index, { tag: e.target.value })}
                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Content Title"
                  value={tab.content?.title || ''}
                  onChange={(e) => updateTabContent(index, { title: e.target.value })}
                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                <textarea
                  placeholder="Lead text"
                  value={tab.content?.lead || ''}
                  onChange={(e) => updateTabContent(index, { lead: e.target.value })}
                  rows={2}
                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                <textarea
                  placeholder="Example"
                  value={tab.content?.example || ''}
                  onChange={(e) => updateTabContent(index, { example: e.target.value })}
                  rows={2}
                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />

                {/* Enhanced Infographic with Theme/Animation/Style */}
                <InfographicFieldEditor
                  value={tab.content?.infographic}
                  onChange={(config) => updateTabContent(index, { infographic: config })}
                  label="Infographic"
                  showAdvancedSettings={true}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
