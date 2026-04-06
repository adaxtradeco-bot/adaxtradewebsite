/**
 * Industry Badges Section
 * Author: Amazon Q
 * Created: 2024-01-20
 */
'use client';

import React from 'react';

interface IndustryBadge {
  icon: string;
  label: string;
  color: string;
}

interface IndustryBadgesSectionProps {
  data: {
    eyebrow?: string;
    title?: string;
    highlightedTitle?: string;
    subtitle?: string;
    badges: IndustryBadge[];
  };
  style?: {
    backgroundColor?: string;
    textColor?: string;
    padding?: string;
  };
}

export default function IndustryBadgesSection({ data, style }: IndustryBadgesSectionProps) {
  return (
    <section className={`py-16 border-t border-white/5 ${style?.backgroundColor || 'bg-slate-900'} ${style?.textColor || 'text-white'} ${style?.padding || ''}`}>
      <div className="max-w-6xl mx-auto px-8 text-center">
        {data.eyebrow && (
          <div className="text-xs font-semibold tracking-widest uppercase text-indigo-300 mb-3">
            {data.eyebrow}
          </div>
        )}

        <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-3">
          {data.title}
          {data.highlightedTitle && (
            <>
              <br />
              <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 bg-clip-text text-transparent">
                {data.highlightedTitle}
              </span>
            </>
          )}
        </h2>

        {data.subtitle && (
          <p className="text-base text-slate-300 leading-relaxed max-w-xl mx-auto mb-8">
            {data.subtitle}
          </p>
        )}

        <div className="flex gap-2.5 flex-wrap justify-center mt-8">
          {data.badges.map((badge, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 bg-slate-900/50 border border-white/20 rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-300 hover:border-indigo-500/40 hover:bg-slate-800/50 cursor-default"
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: badge.color }}
              />
              {badge.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
