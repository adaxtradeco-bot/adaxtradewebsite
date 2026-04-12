/**
 * Governance Grid Section - Phase 7
 * Author: Amazon Q
 * Created: 2024-01-20
 */
'use client';

import React from 'react';
import InfographicRenderer from './InfographicRenderer';

interface GovernanceCard {
  tag: string;
  title: string;
  description: string;
  example: string;
  color: 'green' | 'indigo' | 'amber' | 'cyan' | 'violet';
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

interface GovernanceGridSectionProps {
  data: {
    eyebrow?: string;
    title?: string;
    highlightedTitle?: string;
    lead?: string;
    cards?: GovernanceCard[];
  };
  style?: {
    backgroundColor?: string;
    textColor?: string;
    padding?: string;
  };
}

const colorClasses = {
  green: 'before:bg-gradient-to-r before:from-green-500 before:to-cyan-500',
  indigo: 'before:bg-gradient-to-r before:from-indigo-500 before:to-violet-500',
  amber: 'before:bg-gradient-to-r before:from-amber-500 before:to-red-500',
  cyan: 'before:bg-gradient-to-r before:from-cyan-500 before:to-blue-500',
  violet: 'before:bg-gradient-to-r before:from-violet-500 before:to-purple-500',
};

export default function GovernanceGridSection({
  data,
  style,
}: GovernanceGridSectionProps) {
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
                bg-white/80 dark:bg-slate-900/50 border border-slate-200/70 dark:border-white/5 rounded-2xl p-6 transition-all duration-300
                hover:border-green-500/30 hover:-translate-y-0.5
                before:content-[''] before:block before:w-full before:h-0.5 before:rounded-sm before:mb-5
                ${colorClasses[card.color]}
              `}
            >
              <div className="text-[10px] font-semibold tracking-widest uppercase text-slate-500 mb-2">
                {card.tag}
              </div>
              <h3 className="text-base font-bold mb-2">{card.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                {card.description}
              </p>
              <div className="text-xs text-slate-500 dark:text-slate-400 italic border-l-2 border-green-500/25 pl-2.5">
                {card.example}
              </div>

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
