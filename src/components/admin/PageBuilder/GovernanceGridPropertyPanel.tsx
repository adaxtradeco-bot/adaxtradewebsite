/**
 * Governance Grid Property Panel with Field Helpers
 * Author: Amazon Q
 * Created: 2024-01-20
 */
'use client';

import React, { useState } from 'react';
import { SectionConfig } from '@/lib/page-builder/section-schemas';
import { InlineFieldHelper } from './InlineFieldHelper';
import { INFOGRAPHIC_DEFAULT_DATA, INFOGRAPHIC_TYPE_OPTIONS, getInfographicStructurePreview } from '@/lib/page-builder/infographic-defaults';

interface GovernanceGridPropertyPanelProps {
  section: SectionConfig;
  onUpdate: (updates: Partial<SectionConfig>) => void;
}

export function GovernanceGridPropertyPanel({
  section,
  onUpdate,
}: GovernanceGridPropertyPanelProps) {
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
      tag: 'New Feature',
      title: 'Feature Title',
      description: 'Feature description',
      example: 'Example usage',
      color: 'indigo',
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
          <InlineFieldHelper
            label="Eyebrow Text"
            description="Small text above the main title"
            examples={['Why CRM on a BPMS?', 'Platform Features']}
          />
        </label>
        <input
          type="text"
          value={data.eyebrow || ''}
          onChange={(e) => updateData({ ...data, eyebrow: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        />
      </div>

      <div>
        <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
        <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
        <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                  Card {index + 1}
                </span>
                <button
                  onClick={() => removeCard(index)}
                  className="text-red-600 hover:text-red-700 text-xs"
                >
                  🗑️ Remove
                </button>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tag
                  </label>
                  <input
                    type="text"
                    value={card.tag || ''}
                    onChange={(e) =>
                      updateCard(index, { tag: e.target.value })
                    }
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
                    onChange={(e) =>
                      updateCard(index, { title: e.target.value })
                    }
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={card.description || ''}
                    onChange={(e) =>
                      updateCard(index, { description: e.target.value })
                    }
                    rows={2}
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Example
                  </label>
                  <textarea
                    value={card.example || ''}
                    onChange={(e) =>
                      updateCard(index, { example: e.target.value })
                    }
                    rows={2}
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="flex items-center text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Color Theme
                    <InlineFieldHelper
                      label="Card Color"
                      description="Gradient color for card top border"
                      values={[
                        { value: 'green', label: 'Green → Cyan', color: 'linear-gradient(to right, #10b981, #06b6d4)' },
                        { value: 'indigo', label: 'Indigo → Violet', color: 'linear-gradient(to right, #6366f1, #8b5cf6)' },
                        { value: 'amber', label: 'Amber → Red', color: 'linear-gradient(to right, #f59e0b, #ef4444)' },
                        { value: 'cyan', label: 'Cyan → Blue', color: 'linear-gradient(to right, #06b6d4, #3b82f6)' },
                        { value: 'violet', label: 'Violet → Purple', color: 'linear-gradient(to right, #8b5cf6, #a855f7)' },
                      ]}
                    />
                  </label>
                  <select
                    value={card.color || 'indigo'}
                    onChange={(e) =>
                      updateCard(index, { color: e.target.value })
                    }
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="green">Green → Cyan</option>
                    <option value="indigo">Indigo → Violet</option>
                    <option value="amber">Amber → Red</option>
                    <option value="cyan">Cyan → Blue</option>
                    <option value="violet">Violet → Purple</option>
                  </select>
                </div>

                {/* Infographic Section */}
                <div className="border-t border-gray-300 dark:border-gray-600 pt-2 mt-2">
                  <label className="flex items-center text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Infographic
                    <InlineFieldHelper
                      label="Infographic Type"
                      description="Visual data representation below the card"
                      values={[
                        { value: 'audit', label: 'Audit Trail - Timeline with icons' },
                        { value: 'stats', label: 'Stats - Metrics grid' },
                        { value: 'flow', label: 'Flow - Process nodes' },
                        { value: 'timeline', label: 'Timeline - Sequential steps' },
                        { value: 'roles', label: 'Roles - User access cards' },
                        { value: 'exception', label: 'Exception - Warning display' },
                      ]}
                      note="Use JSON editor for detailed infographic data configuration"
                    />
                  </label>

                  <select
                    value={card.infographic?.type || ''}
                    onChange={(e) => {
                      const type = e.target.value;
                      if (!type) {
                        updateCard(index, { infographic: undefined });
                      } else {
                        updateCard(index, {
                          infographic: { type, data: INFOGRAPHIC_DEFAULT_DATA[type] || {} },
                        });
                      }
                    }}
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    {INFOGRAPHIC_TYPE_OPTIONS.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>

                  {card.infographic?.type && (
                    <div className="mt-2 space-y-1">
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-[10px] text-blue-800 dark:text-blue-200">
                        💡 Switch to <strong>JSON Editor</strong> to edit data
                      </div>
                      <pre className="p-2 bg-slate-900 text-green-400 rounded text-[9px] leading-relaxed overflow-x-auto max-h-40 overflow-y-auto">{getInfographicStructurePreview(card.infographic.type)}</pre>
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
