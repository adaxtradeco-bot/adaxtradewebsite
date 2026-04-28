/**
 * Form Builder Templates Property Panel
 * Author: Amazon Q
 * Created: 2025-01-XX
 */

'use client';

import React from 'react';
import { SectionConfig } from '@/lib/page-builder/section-schemas';
import { INFOGRAPHIC_TYPE_OPTIONS, INFOGRAPHIC_DEFAULT_DATA } from '@/lib/page-builder/infographic-defaults';
import InfographicFieldEditor from './InfographicFieldEditor';

interface FormBuilderTemplatesPropertyPanelProps {
  section: SectionConfig;
  onUpdate: (updates: Partial<SectionConfig>) => void;
}

export function FormBuilderTemplatesPropertyPanel({ section, onUpdate }: FormBuilderTemplatesPropertyPanelProps) {
  const data = section.data;

  const updateField = (field: string, value: any) => {
    onUpdate({
      data: {
        ...data,
        [field]: value,
      },
    });
  };

  const updateTemplate = (index: number, field: string, value: any) => {
    const templates = [...(data.templates || [])];
    templates[index] = { ...templates[index], [field]: value };
    updateField('templates', templates);
  };

  const updateTemplateInfographic = (index: number, infographicConfig: any) => {
    const templates = [...(data.templates || [])];
    templates[index] = {
      ...templates[index],
      infographic: infographicConfig
    };
    updateField('templates', templates);
  };

  const addTemplate = () => {
    const templates = [...(data.templates || [])];
    templates.push({
      title: 'New Template',
      description: 'Template description',
      icon: 'fas fa-file-alt',
      infographic: undefined
    });
    updateField('templates', templates);
  };

  const removeTemplate = (index: number) => {
    const templates = [...(data.templates || [])];
    templates.splice(index, 1);
    updateField('templates', templates);
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

      {/* Auto-Scroll Settings */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <span>⚡</span> Auto-Scroll Settings
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="autoScroll"
              checked={data.autoScroll !== false}
              onChange={(e) => updateField('autoScroll', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="autoScroll" className="text-sm text-gray-700 dark:text-gray-300">
              Enable auto-scroll carousel
            </label>
          </div>

          {data.autoScroll !== false && (
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Scroll Speed (milliseconds)
              </label>
              <input
                type="number"
                value={data.scrollSpeed || 3000}
                onChange={(e) => updateField('scrollSpeed', parseInt(e.target.value) || 3000)}
                min="1000"
                max="10000"
                step="500"
                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Current: {((data.scrollSpeed || 3000) / 1000).toFixed(1)}s per card
                <br />
                Recommended: 2000-5000ms (2-5 seconds)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Templates */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Templates ({data.templates?.length || 0})
          </label>
          <button
            type="button"
            onClick={addTemplate}
            className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
          >
            + Add
          </button>
        </div>

        <div className="space-y-4">
          {(data.templates || []).map((template: any, index: number) => (
            <div key={index} className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Template {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeTemplate(index)}
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
                    value={template.title || ''}
                    onChange={(e) => updateTemplate(index, 'title', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={template.description || ''}
                    onChange={(e) => updateTemplate(index, 'description', e.target.value)}
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
                    value={template.icon || ''}
                    onChange={(e) => updateTemplate(index, 'icon', e.target.value)}
                    placeholder="fas fa-file-alt"
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Example: fas fa-file-alt, fas fa-chart-bar, fas fa-users
                  </p>
                </div>

                {/* Enhanced Infographic with Theme/Animation/Style */}
                <InfographicFieldEditor
                  value={template.infographic}
                  onChange={(config) => updateTemplateInfographic(index, config)}
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
