/**
 * Flow Builder Property Panel
 * Author: Amazon Q
 * Created: 2025-01-XX
 * 
 * Full dynamic editor for FlowBuilderSection
 */

'use client';

import React, { useState } from 'react';
import { FlowBuilderSectionData, FlowBuilderTab, FlowBuilderItem } from '../../builder-sections/FlowBuilderSection';
import { ImageUploader } from './ImageUploader';

interface FlowBuilderPropertyPanelProps {
  section: any;
  onUpdate: (updates: any) => void;
}

export function FlowBuilderPropertyPanel({ section, onUpdate }: FlowBuilderPropertyPanelProps) {
  const [expandedTab, setExpandedTab] = useState<string | null>(null);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const data = section.data;

  const updateData = (updates: Partial<FlowBuilderSectionData>) => {
    onUpdate({ data: { ...data, ...updates } });
  };

  const updateTab = (tabId: string, updates: Partial<FlowBuilderTab>) => {
    const tabs = data.tabs.map((t: FlowBuilderTab) => t.id === tabId ? { ...t, ...updates } : t);
    updateData({ tabs });
  };

  const addTab = () => {
    const newTab: FlowBuilderTab = {
      id: `tab-${Date.now()}`,
      number: `0${data.tabs.length + 1}`,
      label: 'New Tab',
      title: 'Tab Title',
      description: 'Tab description',
      contentType: 'steps',
      items: []
    };
    updateData({ tabs: [...data.tabs, newTab] });
  };

  const removeTab = (tabId: string) => {
    updateData({ tabs: data.tabs.filter((t: FlowBuilderTab) => t.id !== tabId) });
  };

  const moveTab = (tabId: string, direction: 'up' | 'down') => {
    const index = data.tabs.findIndex((t: FlowBuilderTab) => t.id === tabId);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === data.tabs.length - 1) return;

    const newTabs = [...data.tabs];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newTabs[index], newTabs[newIndex]] = [newTabs[newIndex], newTabs[index]];
    updateData({ tabs: newTabs });
  };

  const addItem = (tabId: string) => {
    const tab = data.tabs.find((t: FlowBuilderTab) => t.id === tabId);
    if (!tab) return;

    const newItem: FlowBuilderItem = {
      id: `item-${Date.now()}`,
      label: 'New Item',
      icon: '📌'
    };

    updateTab(tabId, { items: [...tab.items, newItem] });
  };

  const updateItem = (tabId: string, itemId: string, updates: Partial<FlowBuilderItem>) => {
    const tab = data.tabs.find((t: FlowBuilderTab) => t.id === tabId);
    if (!tab) return;

    const items = tab.items.map((i: FlowBuilderItem) => i.id === itemId ? { ...i, ...updates } : i);
    updateTab(tabId, { items });
  };

  const removeItem = (tabId: string, itemId: string) => {
    const tab = data.tabs.find((t: FlowBuilderTab) => t.id === tabId);
    if (!tab) return;

    updateTab(tabId, { items: tab.items.filter((i: FlowBuilderItem) => i.id !== itemId) });
  };

  return (
    <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
      {/* Theme */}
      <div>
        <label className="block text-sm font-medium mb-2">Theme</label>
        <select
          value={data.theme}
          onChange={(e) => updateData({ theme: e.target.value as 'light' | 'dark' })}
          className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>

      {/* Eyebrow */}
      <div className="border-t pt-4">
        <label className="block text-sm font-medium mb-2">Eyebrow Badge</label>
        <input
          type="text"
          value={data.eyebrow?.text || ''}
          onChange={(e) => updateData({ eyebrow: { icon: data.eyebrow?.icon, text: e.target.value } })}
          placeholder="e.g., Visual Process Designer"
          className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 mb-2"
        />
        <input
          type="text"
          value={data.eyebrow?.icon || ''}
          onChange={(e) => updateData({ eyebrow: { text: data.eyebrow?.text || '', icon: e.target.value } })}
          placeholder="Icon (emoji or text)"
          className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800"
        />
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-2">Title</label>
        <input
          type="text"
          value={data.title}
          onChange={(e) => updateData({ title: e.target.value })}
          className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 mb-2"
        />
        <input
          type="text"
          value={data.titleHighlight || ''}
          onChange={(e) => updateData({ titleHighlight: e.target.value })}
          placeholder="Highlighted part (optional)"
          className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <textarea
          value={data.description}
          onChange={(e) => updateData({ description: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800"
        />
      </div>

      {/* Header Media */}
      <div className="border-t pt-4">
        <label className="block text-sm font-medium mb-2">Header Media (Optional)</label>
        <div className="space-y-2">
          <select
            value={data.headerMedia?.type || 'image'}
            onChange={(e) => updateData({
              headerMedia: { type: e.target.value as 'image' | 'video', src: data.headerMedia?.src || '', position: data.headerMedia?.position || 'right' }
            })}
            className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800"
          >
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>

          <ImageUploader
            value={data.headerMedia?.src || ''}
            onChange={(src) => updateData({
              headerMedia: { type: data.headerMedia?.type || 'image', src: typeof src === 'string' ? src : src.src || '', position: data.headerMedia?.position || 'right' }
            })}
          />

          <select
            value={data.headerMedia?.position || 'right'}
            onChange={(e) => updateData({
              headerMedia: { type: data.headerMedia?.type || 'image', src: data.headerMedia?.src || '', position: e.target.value as 'left' | 'right' }
            })}
            className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800"
          >
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>

          {data.headerMedia?.src && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                updateData({ headerMedia: undefined });
              }}
              className="text-xs text-red-600 hover:underline"
            >
              Remove Header Media
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium">Tabs ({data.tabs.length})</label>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              addTab();
            }}
            className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
          >
            + Add Tab
          </button>
        </div>

        <div className="space-y-3">
          {data.tabs.map((tab: FlowBuilderTab, index: number) => (
            <div key={tab.id} className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center justify-between mb-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setExpandedTab(expandedTab === tab.id ? null : tab.id);
                  }}
                  className="text-sm font-medium flex-1 text-left"
                >
                  {expandedTab === tab.id ? '▼' : '▶'} {tab.number} - {tab.label}
                </button>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      moveTab(tab.id, 'up');
                    }}
                    disabled={index === 0}
                    className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      moveTab(tab.id, 'down');
                    }}
                    disabled={index === data.tabs.length - 1}
                    className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      removeTab(tab.id);
                    }}
                    className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {expandedTab === tab.id && (
                <div className="space-y-3 mt-3 pl-2 border-l-2 border-blue-500">
                  <input
                    type="text"
                    value={tab.number}
                    onChange={(e) => updateTab(tab.id, { number: e.target.value })}
                    placeholder="Number (e.g., 01)"
                    className="w-full px-2 py-1 border rounded text-sm bg-white dark:bg-gray-900"
                  />
                  <input
                    type="text"
                    value={tab.label}
                    onChange={(e) => updateTab(tab.id, { label: e.target.value })}
                    placeholder="Tab Label"
                    className="w-full px-2 py-1 border rounded text-sm bg-white dark:bg-gray-900"
                  />
                  <input
                    type="text"
                    value={tab.tag || ''}
                    onChange={(e) => updateTab(tab.id, { tag: e.target.value })}
                    placeholder="Tag (optional)"
                    className="w-full px-2 py-1 border rounded text-sm bg-white dark:bg-gray-900"
                  />
                  <input
                    type="text"
                    value={tab.title}
                    onChange={(e) => updateTab(tab.id, { title: e.target.value })}
                    placeholder="Content Title"
                    className="w-full px-2 py-1 border rounded text-sm bg-white dark:bg-gray-900"
                  />
                  <textarea
                    value={tab.description}
                    onChange={(e) => updateTab(tab.id, { description: e.target.value })}
                    placeholder="Description"
                    rows={2}
                    className="w-full px-2 py-1 border rounded text-sm bg-white dark:bg-gray-900"
                  />
                  <textarea
                    value={tab.exampleText || ''}
                    onChange={(e) => updateTab(tab.id, { exampleText: e.target.value })}
                    placeholder="Example text (optional)"
                    rows={2}
                    className="w-full px-2 py-1 border rounded text-sm bg-white dark:bg-gray-900"
                  />

                  <div>
                    <label className="block text-xs font-medium mb-1">Content Type</label>
                    <select
                      value={tab.contentType}
                      onChange={(e) => updateTab(tab.id, { contentType: e.target.value as any })}
                      className="w-full px-2 py-1 border rounded text-sm bg-white dark:bg-gray-900"
                    >
                      <option value="steps">Steps</option>
                      <option value="features">Features</option>
                      <option value="card">Card</option>
                    </select>
                  </div>

                  {/* Tab Media */}
                  <div className="border-t pt-2">
                    <label className="block text-xs font-medium mb-1">Tab Media (Optional)</label>
                    <select
                      value={tab.media?.type || 'image'}
                      onChange={(e) => updateTab(tab.id, {
                        media: { ...tab.media, type: e.target.value as 'image' | 'video', src: tab.media?.src || '' }
                      })}
                      className="w-full px-2 py-1 border rounded text-sm bg-white dark:bg-gray-900 mb-2"
                    >
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                    </select>

                    <ImageUploader
                      value={tab.media?.src || ''}
                      onChange={(src) => updateTab(tab.id, {
                        media: { ...tab.media, src: typeof src === 'string' ? src : src.src || '', type: tab.media?.type || 'image' }
                      })}
                    />

                    {tab.media?.src && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          updateTab(tab.id, { media: undefined });
                        }}
                        className="text-xs text-red-600 hover:underline mt-1"
                      >
                        Remove Tab Media
                      </button>
                    )}
                  </div>

                  {/* Items */}
                  {!tab.media && (
                    <div className="border-t pt-2">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-medium">Items ({tab.items.length})</label>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            addItem(tab.id);
                          }}
                          className="px-2 py-0.5 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                        >
                          + Item
                        </button>
                      </div>

                      <div className="space-y-2">
                        {tab.items.map((item: FlowBuilderItem) => (
                          <div key={item.id} className="border rounded p-2 bg-white dark:bg-gray-900">
                            <div className="flex items-center justify-between mb-1">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setExpandedItem(expandedItem === item.id ? null : item.id);
                                }}
                                className="text-xs flex-1 text-left"
                              >
                                {expandedItem === item.id ? '▼' : '▶'} {item.label}
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  removeItem(tab.id, item.id);
                                }}
                                className="px-1.5 py-0.5 text-xs bg-red-600 text-white rounded"
                              >
                                ✕
                              </button>
                            </div>

                            {expandedItem === item.id && (
                              <div className="space-y-2 mt-2">
                                <input
                                  type="text"
                                  value={item.icon || ''}
                                  onChange={(e) => updateItem(tab.id, item.id, { icon: e.target.value })}
                                  placeholder="Icon (emoji)"
                                  className="w-full px-2 py-1 border rounded text-xs bg-gray-50 dark:bg-gray-800"
                                />
                                <input
                                  type="text"
                                  value={item.number || ''}
                                  onChange={(e) => updateItem(tab.id, item.id, { number: e.target.value })}
                                  placeholder="Number (optional)"
                                  className="w-full px-2 py-1 border rounded text-xs bg-gray-50 dark:bg-gray-800"
                                />
                                <input
                                  type="text"
                                  value={item.label}
                                  onChange={(e) => updateItem(tab.id, item.id, { label: e.target.value })}
                                  placeholder="Label"
                                  className="w-full px-2 py-1 border rounded text-xs bg-gray-50 dark:bg-gray-800"
                                />
                                <input
                                  type="text"
                                  value={item.description || ''}
                                  onChange={(e) => updateItem(tab.id, item.id, { description: e.target.value })}
                                  placeholder="Description (optional)"
                                  className="w-full px-2 py-1 border rounded text-xs bg-gray-50 dark:bg-gray-800"
                                />

                                {/* Badge */}
                                <div className="border-t pt-2">
                                  <label className="block text-xs font-medium mb-1">Badge (Optional)</label>
                                  <input
                                    type="text"
                                    value={item.badge?.text || ''}
                                    onChange={(e) => updateItem(tab.id, item.id, {
                                      badge: { ...item.badge, text: e.target.value, color: item.badge?.color || '#3B82F6' }
                                    })}
                                    placeholder="Badge text"
                                    className="w-full px-2 py-1 border rounded text-xs bg-gray-50 dark:bg-gray-800 mb-1"
                                  />
                                  <input
                                    type="color"
                                    value={item.badge?.color || '#3B82F6'}
                                    onChange={(e) => updateItem(tab.id, item.id, {
                                      badge: { ...item.badge, color: e.target.value, text: item.badge?.text || '' }
                                    })}
                                    className="w-full h-8 border rounded"
                                  />
                                  {item.badge?.text && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        updateItem(tab.id, item.id, { badge: undefined });
                                      }}
                                      className="text-xs text-red-600 hover:underline mt-1"
                                    >
                                      Remove Badge
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Auto-rotation Settings */}
      <div className="border-t pt-4">
        <label className="flex items-center gap-2 mb-3">
          <input
            type="checkbox"
            checked={data.autoRotate}
            onChange={(e) => updateData({ autoRotate: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm font-medium">Auto-rotate Tabs</span>
        </label>

        {data.autoRotate && (
          <div className="space-y-2 pl-6">
            <div>
              <label className="block text-xs mb-1">Interval (ms)</label>
              <input
                type="number"
                value={data.rotationInterval}
                onChange={(e) => updateData({ rotationInterval: parseInt(e.target.value) || 4000 })}
                min="1000"
                step="500"
                className="w-full px-2 py-1 border rounded text-sm bg-white dark:bg-gray-800"
              />
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={data.pauseOnHover}
                onChange={(e) => updateData({ pauseOnHover: e.target.checked })}
                className="rounded"
              />
              <span className="text-xs">Pause on Hover</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={data.showProgressBar}
                onChange={(e) => updateData({ showProgressBar: e.target.checked })}
                className="rounded"
              />
              <span className="text-xs">Show Progress Bar</span>
            </label>
          </div>
        )}

        <label className="flex items-center gap-2 mt-3">
          <input
            type="checkbox"
            checked={data.showDots}
            onChange={(e) => updateData({ showDots: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm">Show Dots Navigation</span>
        </label>
      </div>

      {/* Animations */}
      <div className="border-t pt-4">
        <label className="flex items-center gap-2 mb-3">
          <input
            type="checkbox"
            checked={data.animations?.enabled ?? true}
            onChange={(e) => updateData({
              animations: { ...data.animations, enabled: e.target.checked, tabTransition: data.animations?.tabTransition || 'fade', duration: data.animations?.duration || 350, stagger: data.animations?.stagger || 0.05 }
            })}
            className="rounded"
          />
          <span className="text-sm font-medium">Enable Animations</span>
        </label>

        {data.animations?.enabled && (
          <div className="space-y-2 pl-6">
            <div>
              <label className="block text-xs mb-1">Transition Type</label>
              <select
                value={data.animations.tabTransition}
                onChange={(e) => updateData({
                  animations: { ...data.animations, tabTransition: e.target.value as any }
                })}
                className="w-full px-2 py-1 border rounded text-sm bg-white dark:bg-gray-800"
              >
                <option value="fade">Fade</option>
                <option value="slide">Slide</option>
                <option value="scale">Scale</option>
              </select>
            </div>

            <div>
              <label className="block text-xs mb-1">Duration (ms)</label>
              <input
                type="number"
                value={data.animations.duration}
                onChange={(e) => updateData({
                  animations: { ...data.animations, duration: parseInt(e.target.value) || 350 }
                })}
                min="100"
                step="50"
                className="w-full px-2 py-1 border rounded text-sm bg-white dark:bg-gray-800"
              />
            </div>

            <div>
              <label className="block text-xs mb-1">Stagger Delay (s)</label>
              <input
                type="number"
                value={data.animations.stagger}
                onChange={(e) => updateData({
                  animations: { ...data.animations, stagger: parseFloat(e.target.value) || 0.05 }
                })}
                min="0"
                step="0.01"
                max="0.5"
                className="w-full px-2 py-1 border rounded text-sm bg-white dark:bg-gray-800"
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="border-t pt-4">
        <label className="block text-sm font-medium mb-2">Footer CTA (Optional)</label>
        <input
          type="text"
          value={data.footerCTA?.text || ''}
          onChange={(e) => updateData({
            footerCTA: { text: e.target.value, link: data.footerCTA?.link }
          })}
          placeholder="e.g., View all templates →"
          className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 mb-2"
        />
        <input
          type="text"
          value={data.footerCTA?.link || ''}
          onChange={(e) => updateData({
            footerCTA: { text: data.footerCTA?.text || '', link: e.target.value }
          })}
          placeholder="Link URL (optional)"
          className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800"
        />
        {data.footerCTA?.text && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              updateData({ footerCTA: undefined });
            }}
            className="text-xs text-red-600 hover:underline mt-1"
          >
            Remove Footer CTA
          </button>
        )}
      </div>
    </div>
  );
}
