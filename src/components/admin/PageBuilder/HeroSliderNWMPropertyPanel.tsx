/**
 * Hero Slider NWM Property Panel
 * Author: Amazon Q
 * Created: 2024-01-20
 */
'use client';

import React, { useState } from 'react';
import { SectionConfig } from '@/lib/page-builder/section-schemas';
import { InlineFieldHelper } from './InlineFieldHelper';

interface HeroSliderNWMPropertyPanelProps {
  section: SectionConfig;
  onUpdate: (updates: Partial<SectionConfig>) => void;
}

export function HeroSliderNWMPropertyPanel({
  section,
  onUpdate,
}: HeroSliderNWMPropertyPanelProps) {
  const [data, setData] = useState(section.data);

  const updateData = (newData: any) => {
    setData(newData);
    onUpdate({ data: newData });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Autoplay Interval (ms)
          <InlineFieldHelper
            label="Autoplay Interval (ms)"
            description="Time between automatic slide changes"
            examples={['5000', '7000', '10000']}
          />
        </label>
        <input
          type="number"
          value={data.autoPlayInterval || 5000}
          onChange={(e) => updateData({ ...data, autoPlayInterval: parseInt(e.target.value) })}
          min="1000"
          step="500"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        />
      </div>

      {/* Slides Info */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Per-Slide Image Settings
        </h4>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <p className="text-sm text-blue-800 dark:text-blue-200 font-semibold mb-2">
            💡 Use JSON editor below to configure each slide:
          </p>
          <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
            <ul className="ml-4 list-disc space-y-1">
              <li>
                <code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">useImageInsteadOfCard: true</code> - Show image instead of card
              </li>
              <li>
                <code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">cardImage: "path/to/image.jpg"</code> - Image path
              </li>
              <li className="flex items-center gap-1">
                <code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">cardImageWidth: 600</code> - Image width in pixels (default: 600)
                <InlineFieldHelper
                  label="Card Image Width"
                  description="Image width in pixels"
                  examples={['600', '800', '1000']}
                  note="Default: 600px"
                />
              </li>
              <li className="flex items-center gap-1">
                <code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">cardImageHeight: 400</code> - Image height in pixels (default: 400)
                <InlineFieldHelper
                  label="Card Image Height"
                  description="Image height in pixels"
                  examples={['400', '500', '600']}
                  note="Default: 400px"
                />
              </li>
              <li className="flex items-center gap-1">
                <code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">enableMagnifier: true</code> - Enable zoom on hover (default: false)
                <InlineFieldHelper
                  label="Enable Magnifier"
                  description="Zoom effect on hover"
                  values={[
                    { value: 'true', label: 'Enabled - Zoom on hover' },
                    { value: 'false', label: 'Disabled - No zoom' },
                  ]}
                  note="Default: false"
                />
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
