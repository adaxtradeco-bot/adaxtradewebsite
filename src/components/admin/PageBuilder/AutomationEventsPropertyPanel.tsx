/**
 * Automation Events Property Panel
 * Author: Amazon Q
 * Created: 2025-01-XX
 */

'use client';

import React, { useState } from 'react';
import { AutomationEventsSectionData, AutomationEvent, FlowStep } from '../../builder-sections/AutomationEventsSection';
import { ImageUploader } from './ImageUploader';
import { IconPicker, IconDisplay } from '@/components/ui/IconPicker';
import { INFOGRAPHIC_TYPE_OPTIONS, INFOGRAPHIC_DEFAULT_DATA } from '@/lib/page-builder/infographic-defaults';

interface AutomationEventsPropertyPanelProps {
  section: any;
  onUpdate: (updates: any) => void;
}

export function AutomationEventsPropertyPanel({ section, onUpdate }: AutomationEventsPropertyPanelProps) {
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  const data = section.data;

  const updateData = (updates: Partial<AutomationEventsSectionData>) => {
    onUpdate({ data: { ...data, ...updates } });
  };

  const updateEvent = (eventId: string, updates: Partial<AutomationEvent>) => {
    const events = data.events.map((e: AutomationEvent) => e.id === eventId ? { ...e, ...updates } : e);
    updateData({ events });
  };

  const addEvent = () => {
    const newEvent: AutomationEvent = {
      id: `event-${Date.now()}`,
      icon: { name: 'bell', type: 'solid', size: 'lg', color: '#4F7FFF' },
      name: 'New Event',
      subtitle: 'Event description',
      color: '#4F7FFF',
      tag: 'Event Type',
      title: 'Event Title',
      description: 'Event description text',
      infographicType: 'workflow',
      infographicData: INFOGRAPHIC_DEFAULT_DATA['workflow'],
      exampleLabel: 'eg.',
      exampleText: 'Example scenario text'
    };
    updateData({ events: [...data.events, newEvent] });
  };

  const removeEvent = (eventId: string) => {
    updateData({ events: data.events.filter((e: AutomationEvent) => e.id !== eventId) });
  };

  const moveEvent = (eventId: string, direction: 'up' | 'down') => {
    const index = data.events.findIndex((e: AutomationEvent) => e.id === eventId);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === data.events.length - 1) return;

    const newEvents = [...data.events];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newEvents[index], newEvents[newIndex]] = [newEvents[newIndex], newEvents[index]];
    updateData({ events: newEvents });
  };

  const addStep = (eventId: string) => {
    // Not used anymore - kept for backward compatibility
  };

  const updateStep = (eventId: string, stepId: string, updates: Partial<FlowStep>) => {
    // Not used anymore - kept for backward compatibility
  };

  const removeStep = (eventId: string, stepId: string) => {
    // Not used anymore - kept for backward compatibility
  };

  const handleInfographicTypeChange = (eventId: string, type: string) => {
    const defaultData = type ? INFOGRAPHIC_DEFAULT_DATA[type] || {} : {};
    updateEvent(eventId, {
      infographicType: type,
      infographicData: defaultData
    });
  };

  return (
    <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
      {/* Eyebrow */}
      <div>
        <label className="block text-sm font-medium mb-2">Eyebrow Badge</label>
        <input
          type="text"
          value={data.eyebrow?.text || ''}
          onChange={(e) => updateData({ eyebrow: { icon: data.eyebrow?.icon, text: e.target.value } })}
          placeholder="e.g., Events, Actions & Automation"
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

      {/* Header Right */}
      <div className="border-t pt-4">
        <label className="block text-sm font-medium mb-2">Header Right Section</label>
        <textarea
          value={data.headerRight?.description || ''}
          onChange={(e) => updateData({
            headerRight: { description: e.target.value, stats: data.headerRight?.stats || [] }
          })}
          placeholder="Description text"
          rows={3}
          className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 mb-3"
        />

        <label className="block text-xs font-medium mb-2">Stats</label>
        {data.headerRight?.stats?.map((stat: any, idx: number) => (
          <div key={idx} className="flex gap-2 mb-2">
            <input
              type="text"
              value={stat.value}
              onChange={(e) => {
                const stats = [...(data.headerRight?.stats || [])];
                stats[idx] = { ...stats[idx], value: e.target.value };
                updateData({ headerRight: { ...data.headerRight, stats } });
              }}
              placeholder="Value (e.g., 6+)"
              className="flex-1 px-2 py-1 border rounded text-sm bg-white dark:bg-gray-800"
            />
            <input
              type="text"
              value={stat.label}
              onChange={(e) => {
                const stats = [...(data.headerRight?.stats || [])];
                stats[idx] = { ...stats[idx], label: e.target.value };
                updateData({ headerRight: { ...data.headerRight, stats } });
              }}
              placeholder="Label"
              className="flex-1 px-2 py-1 border rounded text-sm bg-white dark:bg-gray-800"
            />
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                const stats = (data.headerRight?.stats || []).filter((_: any, i: number) => i !== idx);
                updateData({ headerRight: { ...data.headerRight, stats } });
              }}
              className="px-2 py-1 bg-red-600 text-white rounded text-xs"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            const stats = [...(data.headerRight?.stats || []), { value: '0', label: 'label' }];
            updateData({ headerRight: { ...data.headerRight, stats } });
          }}
          className="px-3 py-1 bg-green-600 text-white rounded text-xs"
        >
          + Add Stat
        </button>
      </div>

      {/* Events */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium">Events ({data.events.length})</label>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              addEvent();
            }}
            className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
          >
            + Add Event
          </button>
        </div>

        <div className="space-y-3">
          {data.events.map((event: AutomationEvent, index: number) => (
            <div key={event.id} className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center justify-between mb-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setExpandedEvent(expandedEvent === event.id ? null : event.id);
                  }}
                  className="text-sm font-medium flex-1 text-left flex items-center gap-2"
                >
                  {expandedEvent === event.id ? '▼' : '▶'}
                  {typeof event.icon === 'string' ? event.icon : <IconDisplay icon={event.icon} />}
                  {event.name}
                </button>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      moveEvent(event.id, 'up');
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
                      moveEvent(event.id, 'down');
                    }}
                    disabled={index === data.events.length - 1}
                    className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      removeEvent(event.id);
                    }}
                    className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {expandedEvent === event.id && (
                <div className="space-y-3 mt-3 pl-2 border-l-2 border-blue-500">
                  {/* Icon Picker */}
                  <div>
                    <label className="block text-xs font-medium mb-1">Icon</label>
                    <IconPicker
                      value={typeof event.icon === 'string' ? undefined : event.icon}
                      onChange={(icon) => updateEvent(event.id, { icon: icon || '' })}
                    />
                  </div>

                  <input
                    type="text"
                    value={event.name}
                    onChange={(e) => updateEvent(event.id, { name: e.target.value })}
                    placeholder="Event Name"
                    className="w-full px-2 py-1 border rounded text-sm bg-white dark:bg-gray-900"
                  />
                  <input
                    type="text"
                    value={event.subtitle}
                    onChange={(e) => updateEvent(event.id, { subtitle: e.target.value })}
                    placeholder="Subtitle"
                    className="w-full px-2 py-1 border rounded text-sm bg-white dark:bg-gray-900"
                  />

                  <div>
                    <label className="block text-xs font-medium mb-1">Color</label>
                    <input
                      type="color"
                      value={event.color}
                      onChange={(e) => updateEvent(event.id, { color: e.target.value })}
                      className="w-full h-10 border rounded"
                    />
                  </div>

                  <input
                    type="text"
                    value={event.tag}
                    onChange={(e) => updateEvent(event.id, { tag: e.target.value })}
                    placeholder="Tag"
                    className="w-full px-2 py-1 border rounded text-sm bg-white dark:bg-gray-900"
                  />
                  <input
                    type="text"
                    value={event.title}
                    onChange={(e) => updateEvent(event.id, { title: e.target.value })}
                    placeholder="Panel Title"
                    className="w-full px-2 py-1 border rounded text-sm bg-white dark:bg-gray-900"
                  />
                  <textarea
                    value={event.description}
                    onChange={(e) => updateEvent(event.id, { description: e.target.value })}
                    placeholder="Description"
                    rows={3}
                    className="w-full px-2 py-1 border rounded text-sm bg-white dark:bg-gray-900"
                  />

                  {/* Infographic Type Selector */}
                  <div>
                    <label className="block text-xs font-medium mb-1">Visualization Type</label>
                    <select
                      value={event.infographicType || ''}
                      onChange={(e) => handleInfographicTypeChange(event.id, e.target.value)}
                      className="w-full px-2 py-1 border rounded text-sm bg-white dark:bg-gray-900"
                    >
                      {INFOGRAPHIC_TYPE_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Select infographic type. Default data will be applied automatically.
                    </p>
                  </div>

                  {/* Example */}
                  <div className="border-t pt-2">
                    <label className="block text-xs font-medium mb-1">Example Section</label>
                    <input
                      type="text"
                      value={event.exampleLabel || ''}
                      onChange={(e) => updateEvent(event.id, { exampleLabel: e.target.value })}
                      placeholder="Label (e.g., eg.)"
                      className="w-full px-2 py-1 border rounded text-xs bg-white dark:bg-gray-900 mb-2"
                    />
                    <textarea
                      value={event.exampleText || ''}
                      onChange={(e) => updateEvent(event.id, { exampleText: e.target.value })}
                      placeholder="Example text (HTML allowed: <strong>bold</strong>)"
                      rows={2}
                      className="w-full px-2 py-1 border rounded text-xs bg-white dark:bg-gray-900"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="border-t pt-4">
        <label className="flex items-center gap-2 mb-3">
          <input
            type="checkbox"
            checked={data.autoRotate}
            onChange={(e) => updateData({ autoRotate: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm font-medium">Auto-rotate Events</span>
        </label>

        {data.autoRotate && (
          <div className="space-y-2 pl-6">
            <div>
              <label className="block text-xs mb-1">Interval (ms)</label>
              <input
                type="number"
                value={data.rotationInterval}
                onChange={(e) => updateData({ rotationInterval: parseInt(e.target.value) || 5000 })}
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
          </div>
        )}

        <label className="flex items-center gap-2 mt-3">
          <input
            type="checkbox"
            checked={data.showNavigation}
            onChange={(e) => updateData({ showNavigation: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm">Show Navigation Controls</span>
        </label>
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
          placeholder="e.g., See automation in action →"
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
      </div>
    </div>
  );
}
