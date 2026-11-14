/**
 * Preview Modes - compact device switch (shown once, inside the Toolbar)
 */

'use client';

import React from 'react';
import { Icon } from '@/components/admin/icons';

type Mode = 'desktop' | 'tablet' | 'mobile';

interface PreviewModesProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
}

const MODES: { id: Mode; label: string; width: string }[] = [
  { id: 'desktop', label: 'Desktop', width: 'Full width' },
  { id: 'tablet', label: 'Tablet', width: '768px' },
  { id: 'mobile', label: 'Mobile', width: '375px' },
];

export function PreviewModes({ mode, onModeChange }: PreviewModesProps) {
  return (
    <div className="inline-flex p-[3px] rounded-[10px] bg-[#F2F4F7]" role="group" aria-label="Preview device">
      {MODES.map((m) => (
        <button
          key={m.id}
          onClick={() => onModeChange(m.id)}
          aria-label={m.label}
          aria-pressed={mode === m.id}
          title={`${m.label} - ${m.width}`}
          className={`h-[30px] px-[9px] grid place-items-center rounded-lg ${
            mode === m.id ? 'bg-white text-[#101828] shadow-[0_1px_2px_rgba(16,24,40,.12)]' : 'text-[#475467] hover:text-[#101828]'
          }`}
        >
          <Icon name={m.id} />
        </button>
      ))}
    </div>
  );
}
