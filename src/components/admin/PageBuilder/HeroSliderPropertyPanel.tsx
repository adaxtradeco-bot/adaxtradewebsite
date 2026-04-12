/**
 * Hero Slider Property Panel
 * Author: Amazon Q
 * Created: 2024-01-20
 */
'use client';

import React, { useState } from 'react';
import { SectionConfig } from '@/lib/page-builder/section-schemas';
import { InlineFieldHelper } from './InlineFieldHelper';

interface HeroSliderPropertyPanelProps {
  section: SectionConfig;
  onUpdate: (updates: Partial<SectionConfig>) => void;
}

export function HeroSliderPropertyPanel({
  section,
  onUpdate,
}: HeroSliderPropertyPanelProps) {
  const [data, setData] = useState(section.data);

  const updateData = (newData: any) => {
    setData(newData);
    onUpdate({ data: newData });
  };

  return (
    <div className="space-y-4">
      {/* Global Settings */}
      <div>
        <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Global Min Height
          <InlineFieldHelper
            label="Global Min Height"
            description="Default minimum height for all slides"
            values={[
              { value: '90vh', label: '90vh - 90% of viewport' },
              { value: '80vh', label: '80vh - 80% of viewport' },
              { value: '600px', label: '600px - Fixed height' },
              { value: '100%', label: '100% - Full container' },
            ]}
            examples={['90vh', '600px', '80vh']}
            note="Can be overridden per slide with minHeight property"
          />
        </label>
        <input
          type="text"
          value={data.globalMinHeight || '90vh'}
          onChange={(e) => updateData({ ...data, globalMinHeight: e.target.value })}
          placeholder="90vh, 600px, 100%"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        />
      </div>

      <div>
        <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Autoplay
          <InlineFieldHelper
            label="Autoplay"
            description="Automatically advance slides"
            values={[
              { value: 'true', label: 'Enabled' },
              { value: 'false', label: 'Disabled' },
            ]}
          />
        </label>
        <select
          value={String(data.autoplay ?? false)}
          onChange={(e) => updateData({ ...data, autoplay: e.target.value === 'true' })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        >
          <option value="true">Enabled</option>
          <option value="false">Disabled</option>
        </select>
      </div>

      <div>
        <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Interval (ms)
          <InlineFieldHelper
            label="Interval (ms)"
            description="Time between slide transitions"
            examples={['5000', '7000', '10000']}
            note="Minimum recommended: 3000ms (3 seconds)"
          />
        </label>
        <input
          type="number"
          value={data.interval || 5000}
          onChange={(e) => updateData({ ...data, interval: parseInt(e.target.value) })}
          min="1000"
          step="500"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        />
      </div>

      {/* Slides Info */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Slides ({(data.slides || []).length})
        </h4>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <p className="text-sm text-blue-800 dark:text-blue-200 font-semibold mb-2">
            💡 Per-Slide Settings:
          </p>
          <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
            <p>Use the <strong>JSON editor</strong> below to configure individual slides. Each slide can have:</p>
            <ul className="ml-4 list-disc space-y-1 mt-2">
              <li>
                <code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">useImageInsteadOfCard: true</code> - Replace card with image
                <InlineFieldHelper
                  label="Use Image Instead of Card"
                  description="Replace card content with image"
                  values={[
                    { value: 'true', label: 'Show image only' },
                    { value: 'false', label: 'Show card content' },
                  ]}
                />
              </li>
              <li><code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">cardImage: "path/to/image.jpg"</code> - Image to display</li>
              <li><code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">minHeight: "80vh"</code> - Custom height for this slide</li>
              <li>Standard card content (title, description, buttons, etc.)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
