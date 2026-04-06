/**
 * Trust Badges Section
 * Author: Amazon Q
 * Created: 2024-01-20
 */
'use client';

import React from 'react';

interface TrustBadgesSectionProps {
  data: {
    badges?: Array<{
      icon: string;
      text: string;
      color: 'indigo' | 'cyan' | 'green' | 'amber' | 'violet' | 'pink' | 'red';
    }>;
  };
  style?: {
    backgroundColor?: string;
    textColor?: string;
    padding?: string;
  };
}

const colorClasses = {
  indigo:
    'bg-indigo-500/10 border-indigo-500/25 text-indigo-600 dark:text-indigo-300',
  cyan: 'bg-cyan-500/10 border-cyan-500/25 text-cyan-700 dark:text-cyan-400',
  green:
    'bg-green-500/10 border-green-500/25 text-green-700 dark:text-green-400',
  amber:
    'bg-amber-500/10 border-amber-500/25 text-amber-700 dark:text-amber-400',
  violet:
    'bg-violet-500/10 border-violet-500/25 text-violet-700 dark:text-violet-300',
  pink: 'bg-pink-500/10 border-pink-500/25 text-pink-700 dark:text-pink-400',
  red: 'bg-red-500/10 border-red-500/25 text-red-700 dark:text-red-400',
};

export default function TrustBadgesSection({
  data,
  style,
}: TrustBadgesSectionProps) {
  return (
    <div
      className={`py-8 border-t border-slate-200/70 dark:border-white/5 border-b ${style?.backgroundColor || 'bg-white dark:bg-slate-900'} ${style?.textColor || 'text-slate-900 dark:text-white'} ${style?.padding || ''}`}
    >
      <div className="max-w-4xl mx-auto px-8">
        <div className="flex gap-2 flex-wrap justify-center">
          {data.badges?.map((badge, idx) => (
            <span
              key={idx}
              className={`text-xs font-semibold px-3.5 py-1.5 rounded-full border flex items-center gap-1.5 ${colorClasses[badge.color]}`}
            >
              <span>{badge.icon}</span>
              {badge.text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
