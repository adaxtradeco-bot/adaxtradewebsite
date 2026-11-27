'use client';

/**
 * Import wizard — the child fields of a repeater in the field list (spec §6.5, §11.2).
 * Rows are addressed by the child path "<repeaterId>.$.<childId>", the same value as the data-cf
 * marker on every item, so selecting a row outlines the field in all items.
 */
import React from 'react';
import { canMarkAs } from '@/lib/custom-html/detect';
import { repeaterChildPath, type FieldDef, type FieldType } from '@/lib/custom-html/types';

export interface RepeaterFieldRowsProps {
  /** detect root carrying the markers */
  root: Element;
  repeater: FieldDef;
  /** types offered in the type select (limited to those the element can carry) */
  fieldTypes: FieldType[];
  typeLabels: Record<string, string>;
  selectedId: string | null;
  inputClassName: string;
  rowRef: (path: string, node: HTMLDivElement | null) => void;
  onSelect: (path: string) => void;
  onUpdate: (path: string, patch: Partial<FieldDef>) => void;
  /** `field.id` is the child path */
  onChangeType: (field: FieldDef, type: FieldType) => void;
  onRemove: (path: string) => void;
}

export function RepeaterFieldRows({
  root,
  repeater,
  fieldTypes,
  typeLabels,
  selectedId,
  inputClassName,
  rowRef,
  onSelect,
  onUpdate,
  onChangeType,
  onRemove,
}: RepeaterFieldRowsProps) {
  const marked = Array.from(root.querySelectorAll('[data-cf]'));
  const items = Array.isArray(repeater.default) ? repeater.default.length : 0;

  return (
    <div className="ml-4 space-y-2 border-l-2 border-purple-300 pl-3 dark:border-purple-700">
      <p className="text-xs text-gray-500 dark:text-gray-400">
        List of {items} item{items === 1 ? '' : 's'}; each has these fields.
      </p>
      {(repeater.children ?? []).map((child) => {
        const path = repeaterChildPath(repeater.id, child.id);
        const el = marked.find((e) => e.getAttribute('data-cf') === path);
        const types = fieldTypes.filter((t) => t === child.type || (el ? canMarkAs(el, t) : false));
        if (!types.includes(child.type)) types.push(child.type);
        return (
          <div
            key={child.id}
            ref={(node) => rowRef(path, node)}
            data-testid="child-field-row"
            onClick={() => onSelect(path)}
            className={`flex flex-wrap items-center gap-2 rounded-md border p-2 ${
              selectedId === path ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            <input
              aria-label={`Label for ${path}`}
              className={`${inputClassName} min-w-0 flex-1 basis-32`}
              value={child.label}
              maxLength={120}
              onChange={(e) => onUpdate(path, { label: e.target.value })}
            />
            <select
              aria-label={`Type for ${path}`}
              className={`${inputClassName} w-auto`}
              value={child.type}
              onChange={(e) => onChangeType({ ...child, id: path }, e.target.value as FieldType)}
            >
              {types.map((t) => (
                <option key={t} value={t}>{typeLabels[t] ?? t}</option>
              ))}
            </select>
            <label className="flex items-center gap-1 text-xs text-gray-700 dark:text-gray-200">
              <input
                type="checkbox"
                aria-label={`Visible ${path}`}
                checked={!child.hidden}
                onChange={(e) => onUpdate(path, { hidden: e.target.checked ? undefined : true })}
              />
              Visible
            </label>
            <button
              type="button"
              aria-label={`Remove ${path}`}
              className="rounded-md px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(path);
              }}
            >
              Remove
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default RepeaterFieldRows;
