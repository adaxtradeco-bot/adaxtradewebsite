/**
 * Metro Grid Property Panel
 * Author: Amazon Q
 * Created: 2024-01-20
 */
'use client';

import React, { useState } from 'react';
import { SectionConfig } from '@/lib/page-builder/section-schemas';
import { InlineFieldHelper } from './InlineFieldHelper';
import { INFOGRAPHIC_DEFAULT_DATA, INFOGRAPHIC_TYPE_OPTIONS, getInfographicStructurePreview } from '@/lib/page-builder/infographic-defaults';
import { ImageUploader } from './ImageUploader';

interface MetroGridPropertyPanelProps {
  section: SectionConfig;
  onUpdate: (updates: Partial<SectionConfig>) => void;
}

export function MetroGridPropertyPanel({
  section,
  onUpdate,
}: MetroGridPropertyPanelProps) {
  const [data, setData] = useState(section.data);

  const updateData = (newData: any) => {
    setData(newData);
    onUpdate({ data: newData });
  };

  const updateCard = (index: number, updates: any) => {
    const newCards = [...(data.cards || [])];
    newCards[index] = { ...newCards[index], ...updates };
    updateData({ ...data, cards: newCards });
  };

  const addCard = () => {
    const newCard = {
      number: String((data.cards || []).length + 1),
      icon: '🎯',
      tag: 'New Phase',
      title: 'Phase Title',
      description: 'Phase description',
      color: 'indigo',
      span: 'normal',
    };
    updateData({ ...data, cards: [...(data.cards || []), newCard] });
  };

  const removeCard = (index: number) => {
    const newCards = (data.cards || []).filter((_: any, i: number) => i !== index);
    updateData({ ...data, cards: newCards });
  };

  return (
    <div className="space-y-4">
      {/* Header Fields */}
      <div>
        <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
          Highlighted Title
        </label>
        <input
          type="text"
          value={data.highlightedTitle || ''}
          onChange={(e) => updateData({ ...data, highlightedTitle: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Lead Text
        </label>
        <textarea
          value={data.lead || ''}
          onChange={(e) => updateData({ ...data, lead: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        />
      </div>

      {/* Cards */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
            Cards ({(data.cards || []).length})
          </h4>
          <button
            onClick={addCard}
            className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
          >
            + Add Card
          </button>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {(data.cards || []).map((card: any, index: number) => (
            <div
              key={index}
              className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Card {index + 1}: {card.title}
                </span>
                <button
                  onClick={() => removeCard(index)}
                  className="text-red-600 hover:text-red-700 text-xs"
                >
                  🗑️ Remove
                </button>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Number
                    </label>
                    <input
                      type="text"
                      value={card.number || ''}
                      onChange={(e) => updateCard(index, { number: e.target.value })}
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Icon (Emoji)
                    </label>
                    <input
                      type="text"
                      value={card.icon || ''}
                      onChange={(e) => updateCard(index, { icon: e.target.value })}
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tag
                  </label>
                  <input
                    type="text"
                    value={card.tag || ''}
                    onChange={(e) => updateCard(index, { tag: e.target.value })}
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={card.title || ''}
                    onChange={(e) => updateCard(index, { title: e.target.value })}
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={card.description || ''}
                    onChange={(e) => updateCard(index, { description: e.target.value })}
                    rows={2}
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="flex items-center text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Color
                      <InlineFieldHelper
                        label="Card Color"
                        description="Gradient color for card top border"
                        values={[
                          { value: 'indigo', label: 'Indigo → Violet' },
                          { value: 'cyan', label: 'Cyan → Green' },
                          { value: 'amber', label: 'Amber → Red' },
                          { value: 'violet', label: 'Violet → Pink' },
                          { value: 'green', label: 'Green → Cyan' },
                        ]}
                      />
                    </label>
                    <select
                      value={card.color || 'indigo'}
                      onChange={(e) => updateCard(index, { color: e.target.value })}
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="indigo">Indigo → Violet</option>
                      <option value="cyan">Cyan → Green</option>
                      <option value="amber">Amber → Red</option>
                      <option value="violet">Violet → Pink</option>
                      <option value="green">Green → Cyan</option>
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Span
                      <InlineFieldHelper
                        label="Card Span"
                        description="Card size in grid"
                        values={[
                          { value: 'normal', label: 'Normal - 1x1' },
                          { value: 'wide', label: 'Wide - 2x1' },
                          { value: 'tall', label: 'Tall - 1x2' },
                        ]}
                        note="Wide and tall only work on medium+ screens"
                      />
                    </label>
                    <select
                      value={card.span || 'normal'}
                      onChange={(e) => updateCard(index, { span: e.target.value })}
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="normal">Normal (1x1)</option>
                      <option value="wide">Wide (2x1)</option>
                      <option value="tall">Tall (1x2)</option>
                    </select>
                  </div>
                </div>

                {/* Infographic */}
                <div className="border-t border-gray-300 dark:border-gray-600 pt-2 mt-2">
                  <label className="flex items-center text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Infographic
                    <InlineFieldHelper
                      label="Infographic Type"
                      description="Visual data representation"
                      values={[
                        { value: 'flow', label: 'Flow - Sequential steps' },
                        { value: 'org', label: 'Org - Hierarchy' },
                        { value: 'media', label: 'Media - Placeholder' },
                      ]}
                      note="Use JSON editor for detailed configuration"
                    />
                  </label>
                  <select
                    value={card.infographic?.type || ''}
                    onChange={(e) => {
                      const type = e.target.value;
                      if (!type) {
                        updateCard(index, { infographic: undefined });
                      } else {
                        updateCard(index, { infographic: { type, data: INFOGRAPHIC_DEFAULT_DATA[type] || {} } });
                      }
                    }}
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    {INFOGRAPHIC_TYPE_OPTIONS.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>

                  {card.infographic?.type && card.infographic.type !== 'media' && (
                    <div className="mt-2 space-y-1">
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-[10px] text-blue-800 dark:text-blue-200">
                        💡 Switch to <strong>JSON Editor</strong> to edit data
                      </div>
                      <pre className="p-2 bg-slate-900 text-green-400 rounded text-[9px] leading-relaxed overflow-x-auto max-h-40 overflow-y-auto">{getInfographicStructurePreview(card.infographic.type)}</pre>
                    </div>
                  )}

                  {card.infographic?.type === 'media' && (
                    <div className="mt-2">
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Select Media
                      </label>
                      <ImageUploader
                        value={card.infographic.data || ''}
                        onChange={(value) => {
                          updateCard(index, {
                            infographic: {
                              type: 'media',
                              data: typeof value === 'object' ? value : { src: value, type: 'image', alt: '', maxWidth: null, maxHeight: null, objectFit: 'cover' }
                            }
                          });
                        }}
                        acceptTypes={['image/*', 'video/*']}
                      />
                    </div>
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
