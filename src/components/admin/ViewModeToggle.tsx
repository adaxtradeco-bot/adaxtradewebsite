/**
 * ViewModeToggle - segmented Flat / Grouped switch (controlled).
 */

'use client';

import type { ViewMode } from '@/lib/admin/pages-list';

interface ViewModeToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewModeToggle({ value, onChange }: ViewModeToggleProps) {
  const opts: { id: ViewMode; label: string }[] = [
    { id: 'flat', label: 'Flat' },
    { id: 'grouped', label: 'Grouped' },
  ];
  return (
    <div className="inline-flex p-[3px] rounded-[10px] bg-[#F2F4F7]" role="group" aria-label="View mode">
      {opts.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          aria-pressed={value === o.id}
          className={`h-[30px] px-3 rounded-lg text-[13px] font-medium ${
            value === o.id ? 'bg-white text-[#101828] shadow-[0_1px_2px_rgba(16,24,40,.12)]' : 'text-[#475467]'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
