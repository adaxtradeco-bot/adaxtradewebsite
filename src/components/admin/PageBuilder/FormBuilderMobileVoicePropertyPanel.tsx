/**
 * Form Builder Mobile & Voice Property Panel
 * Author: Amazon Q
 * Created: 2025-01-XX
 */

'use client';

import React from 'react';
import { SectionConfig } from '@/lib/page-builder/section-schemas';
import { INFOGRAPHIC_TYPE_OPTIONS, INFOGRAPHIC_DEFAULT_DATA } from '@/lib/page-builder/infographic-defaults';

interface FormBuilderMobileVoicePropertyPanelProps {
  section: SectionConfig;
  onUpdate: (updates: Partial<SectionConfig>) => void;
}

export function FormBuilderMobileVoicePropertyPanel({ section, onUpdate }: FormBuilderMobileVoicePropertyPanelProps) {
  const data = section.data;

  const updateField = (field: string, value: any) => {
    onUpdate({
      data: {
        ...data,
        [field]: value,
      },
    });
  };

  const updateFeature = (index: number, field: string, value: any) => {
    const features = [...(data.features || [])];
    features[index] = { ...features[index], [field]: value };
    updateField('features', features);
  };

  const updateFeatureInfographic = (index: number, type: string) => {
    const features = [...(data.features || [])];
    features[index] = {
      ...features[index],
      infographic: type ? {
        type,
        data: INFOGRAPHIC_DEFAULT_DATA[type] || {}
      } : undefined
    };
    updateField('features', features);
  };

  const addFeature = () => {
    const features = [...(data.features || [])];
    features.push({
      title: 'New Feature',
      description: 'Feature description',
      icon: 'fas fa-mobile-alt',
      infographic: undefined
    });
    updateField('features', features);
  };

  const removeFeature = (index: number) => {
    const features = [...(data.features || [])];
    features.splice(index, 1);
    updateField('features', features);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Title
        </label>
        <input
          type="text"
          value={data.title || ''}
          onChange={(e) => updateField('title', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description
        </label>
        <textarea
          value={data.description || ''}
          onChange={(e) => updateField('description', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Illustration Alt Text
        </label>
        <input
          type="text"
          value={data.illustrationAlt || ''}
          onChange={(e) => updateField('illustrationAlt', e.target.value)}
          placeholder="Mobile screens and voice flow illustration"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      {/* Features */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Features ({data.features?.length || 0})
          </label>
          <button
            type="button"
            onClick={addFeature}
            className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
          >
            + Add
          </button>
        </div>

        <div className="space-y-4">
          {(data.features || []).map((feature: any, index: number) => (
            <div key={index} className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Feature {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeFeature(index)}
                  className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                >
                  Remove
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={feature.title || ''}
                    onChange={(e) => updateFeature(index, 'title', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={feature.description || ''}
                    onChange={(e) => updateFeature(index, 'description', e.target.value)}
                    rows={2}
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Icon (FontAwesome class)
                  </label>
                  <input
                    type="text"
                    value={feature.icon || ''}
                    onChange={(e) => updateFeature(index, 'icon', e.target.value)}
                    placeholder="fas fa-mobile-alt"
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Example: fas fa-mobile-alt, fas fa-microphone, fas fa-qrcode
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Infographic Type
                  </label>
                  <select
                    value={feature.infographic?.type || ''}
                    onChange={(e) => updateFeatureInfographic(index, e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    {INFOGRAPHIC_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {feature.infographic?.type && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      ✓ Using default data for {feature.infographic.type}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
