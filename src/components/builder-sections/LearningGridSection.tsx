/**
 * Learning Grid Section - Phase 8
 * Author: Amazon Q
 * Created: 2024-01-20
 */
'use client';

import React from 'react';

interface LearningCard {
  number: string;
  tag: string;
  title: string;
  description: string;
  example: string;
}

interface LearningGridSectionProps {
  data: {
    eyebrow?: string;
    title?: string;
    highlightedTitle?: string;
    lead?: string;
    cards: LearningCard[];
  };
  style?: {
    backgroundColor?: string;
    textColor?: string;
    padding?: string;
  };
}

export default function LearningGridSection({
  data,
  style,
}: LearningGridSectionProps) {
  return (
    <section
      className={`py-20 border-t border-slate-200/70 dark:border-white/5 ${style?.backgroundColor || 'bg-white dark:bg-slate-900'} ${style?.textColor || 'text-slate-900 dark:text-white'} ${style?.padding || ''}`}
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
          {data.cards.map((card, idx) => (
            <div
              key={idx}
              className="bg-white/80 dark:bg-slate-900/50 border border-slate-200/70 dark:border-white/5 rounded-2xl p-6 transition-all duration-300 hover:border-indigo-500/30 hover:-translate-y-1"
            >
              <div className="text-4xl font-black leading-none bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 bg-clip-text text-transparent mb-2">
                {card.number}
              </div>

              <div className="h-px bg-slate-200 dark:bg-white/10 my-3" />

              <div className="text-[10px] font-semibold tracking-widest uppercase text-slate-500 mb-1.5">
                {card.tag}
              </div>
              <h3 className="text-sm font-bold mb-1.5">{card.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                {card.description}
              </p>
              <div className="text-xs text-slate-500 dark:text-slate-400 italic border-l-2 border-indigo-500/25 pl-2 mt-2">
                {card.example}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
