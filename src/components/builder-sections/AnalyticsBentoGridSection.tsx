/**
 * Analytics Bento Grid Section - Phase 5 & 6
 * Author: Amazon Q
 * Created: 2024-01-20
 */
'use client';

import React from 'react';
import InfographicRenderer from './InfographicRenderer';
import { IconDisplay, type IconConfig } from '@/components/ui/IconPicker';

interface BentoCard {
  icon: string;              // Legacy: emoji
  iconConfig?: IconConfig;   // New: FontAwesome
  tag: string;
  title: string;
  description: string;
  example?: string;
  span?: 'wide' | 'tall' | 'normal';
  color: 'indigo' | 'cyan' | 'green' | 'amber' | 'violet';
  infographic?: {
    type: string;
    data?: any;
    mediaOverride?: {
      type: 'image' | 'video';
      src: string;
      alt?: string;
    };
  };
}

interface AnalyticsBentoGridSectionProps {
  data: {
    eyebrow?: string;
    title?: string;
    highlightedTitle?: string;
    lead?: string;
    cards?: BentoCard[];
  };
  style?: {
    backgroundColor?: string;
    textColor?: string;
    padding?: string;
  };
}

const colorClasses = {
  indigo:
    'after:bg-gradient-to-r after:from-transparent after:via-indigo-500/70 after:to-transparent',
  cyan: 'after:bg-gradient-to-r after:from-transparent after:via-cyan-500/70 after:to-transparent',
  green:
    'after:bg-gradient-to-r after:from-transparent after:via-green-500/70 after:to-transparent',
  amber:
    'after:bg-gradient-to-r after:from-transparent after:via-amber-500/70 after:to-transparent',
  violet:
    'after:bg-gradient-to-r after:from-transparent after:via-violet-500/70 after:to-transparent',
};

export default function AnalyticsBentoGridSection({
  data,
  style,
}: AnalyticsBentoGridSectionProps) {
  const cards = data.cards || [];

  return (
    <section
      className={`py-20 border-t border-slate-200/70 dark:border-white/5 ${style?.backgroundColor || 'bg-slate-50 dark:bg-slate-950'} ${style?.textColor || 'text-slate-900 dark:text-white'} ${style?.padding || ''}`}
    >
      <div className="max-w-6xl mx-auto px-8">
        {data.eyebrow && (
          <div className="text-xs font-semibold tracking-widest uppercase text-indigo-600 dark:text-indigo-300 mb-3">
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

        {data.lead && (
          <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mb-12">
            {data.lead}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {cards.map((card, idx) => (
            <div
              key={idx}
              className={`
                relative bg-white/80 dark:bg-slate-900/50 border border-slate-200/70 dark:border-white/5 rounded-2xl p-6 overflow-hidden transition-all duration-300
                hover:border-indigo-500/25 hover:-translate-y-1 cursor-default
                ${card.span === 'wide' ? 'md:col-span-2' : ''}
                ${card.span === 'tall' ? 'md:row-span-2' : ''}
                after:content-[''] after:absolute after:top-0 after:left-0 after:right-0 after:h-px
                ${colorClasses[card.color]}
              `}
            >
              <div className="text-2xl mb-3">
                {card.iconConfig ? (
                  <IconDisplay icon={card.iconConfig} className="text-3xl" />
                ) : (
                  card.icon
                )}
              </div>
              <div className="text-[10px] font-semibold tracking-widest uppercase text-slate-500 mb-1.5">
                {card.tag}
              </div>
              <h3 className="text-base font-bold mb-1.5">{card.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {card.description}
              </p>

              {card.example && (
                <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 italic border-l-2 border-indigo-500/25 pl-2">
                  {card.example}
                </div>
              )}

              {card.infographic && (
                <InfographicRenderer infographic={card.infographic} />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
