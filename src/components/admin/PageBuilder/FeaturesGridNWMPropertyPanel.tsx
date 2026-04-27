/**
 * Features Grid NWM Property Panel
 * Author: Amazon Q
 * Created: 2025-01-XX
 * Updated: 2025-01-XX - Added IconFieldEditor support and image position
 */

'use client';

import React, { useState } from 'react';
import { SectionConfig } from '@/lib/page-builder/section-schemas';
import { IconFieldEditor } from './IconFieldEditor';
import { IconConfig } from '@/components/ui/IconPicker';

interface FeaturesGridNWMPropertyPanelProps {
  section: SectionConfig;
  onUpdate: (updates: Partial<SectionConfig>) => void;
}

export function FeaturesGridNWMPropertyPanel({
  section,
  onUpdate,
}: FeaturesGridNWMPropertyPanelProps) {
  const [data, setData] = useState(section.data);

  const updateData = (newData: any) => {
    setData(newData);
    onUpdate({ data: newData });
  };

  const features = data.features || [];

  const addFeature = () => {
    const newFeature = {
      title: 'New Feature',
      description: 'Feature description goes here',
      icon: '📌',
      imagePosition: 'top' as 'top' | 'bottom',
      image: '',
    };
    updateData({ features: [...features, newFeature] });
  };

  const updateFeature = (index: number, updates: any) => {
    const updatedFeatures = [...features];
    updatedFeatures[index] = { ...updatedFeatures[index], ...updates };
    updateData({ features: updatedFeatures });
  };

  const removeFeature = (index: number) => {
    const updatedFeatures = features.filter((_: any, i: number) => i !== index);
    updateData({ features: updatedFeatures });
  };

  return (
    <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
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

      {/* Features Management */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
            Features ({features.length})
          </h4>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addFeature();
            }}
            className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
          >
            + Add Feature
          </button>
        </div>

        <div className="space-y-4">
          {features.map((feature: any, index: number) => (
            <div
              key={index}
              className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-sm">Feature {index + 1}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeFeature(index);
                  }}
                  className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                {/* Icon Field */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Icon
                  </label>
                  <IconFieldEditor
                    emoji={typeof feature.icon === 'string' ? feature.icon : ''}
                    faConfig={typeof feature.icon === 'object' ? feature.icon as IconConfig : undefined}
                    onChange={(emoji, faConfig) => {
                      updateFeature(index, { icon: faConfig || emoji });
                    }}
                    label=""
                  />
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={feature.title}
                    onChange={(e) => updateFeature(index, { title: e.target.value })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={feature.description}
                    onChange={(e) => updateFeature(index, { description: e.target.value })}
                    rows={2}
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                  />
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Image URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={feature.image || ''}
                    onChange={(e) => updateFeature(index, { image: e.target.value })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                    placeholder="/images/feature.png"
                  />
                </div>

                {/* Image Position */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Image Position
                  </label>
                  <select
                    value={feature.imagePosition || 'top'}
                    onChange={(e) => updateFeature(index, { imagePosition: e.target.value as 'top' | 'bottom' })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                  >
                    <option value="top">Top (Above title)</option>
                    <option value="bottom">Bottom (Below description)</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FeaturesGridNWMPropertyPanel;
