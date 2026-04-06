/**
 * Analytics Bento Grid Section - Phase 5 & 6
 * Author: Amazon Q
 * Created: 2024-01-20
 */
'use client';

import React from 'react';

interface BentoCard {
  icon: string;
  tag: string;
  title: string;
  description: string;
  example?: string;
  span?: 'wide' | 'tall' | 'normal';
  color: 'indigo' | 'cyan' | 'green' | 'amber' | 'violet';
  infographic?: {
    type: 'kpi' | 'performance' | 'prediction' | 'media';
    data?: any;
  };
}

interface AnalyticsBentoGridSectionProps {
  data: {
    eyebrow?: string;
    title?: string;
    highlightedTitle?: string;
    lead?: string;
    cards: BentoCard[];
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
          {data.cards.map((card, idx) => (
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
              <div className="text-2xl mb-3">{card.icon}</div>
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

              {card.infographic?.type === 'kpi' && (
                <div className="grid grid-cols-2 gap-1.5 mt-3">
                  {card.infographic.data?.kpis?.map((kpi: any, i: number) => (
                    <div
                      key={i}
                      className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-center"
                    >
                      <div
                        className={`text-xl font-extrabold ${
                          kpi.color === 'indigo'
                            ? 'text-indigo-600 dark:text-indigo-300'
                            : kpi.color === 'green'
                              ? 'text-green-700 dark:text-green-400'
                              : kpi.color === 'amber'
                                ? 'text-amber-700 dark:text-amber-400'
                                : 'text-cyan-700 dark:text-cyan-400'
                        }`}
                      >
                        {kpi.value}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {kpi.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {card.infographic?.type === 'performance' && (
                <div className="mt-3 flex flex-col gap-1.5">
                  {card.infographic.data?.performers?.map(
                    (perf: any, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="text-xs text-slate-600 dark:text-slate-300 w-16 flex-shrink-0">
                          {perf.name}
                        </div>
                        <div className="flex-1 h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              perf.score >= 90
                                ? 'bg-green-500'
                                : perf.score >= 70
                                  ? 'bg-cyan-500'
                                  : 'bg-amber-500'
                            }`}
                            style={{ width: `${perf.score}%` }}
                          />
                        </div>
                        <div
                          className={`text-xs font-bold ${
                            perf.score >= 90
                              ? 'text-green-700 dark:text-green-400'
                              : perf.score >= 70
                                ? 'text-cyan-700 dark:text-cyan-400'
                                : 'text-amber-700 dark:text-amber-400'
                          }`}
                        >
                          {perf.score}
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}

              {card.infographic?.type === 'prediction' && (
                <div className="mt-3 flex flex-col gap-1.5">
                  {card.infographic.data?.predictions?.map(
                    (pred: any, i: number) => (
                      <div
                        key={i}
                        className={`flex items-center gap-2 p-2 rounded-lg border ${
                          pred.status === 'ok'
                            ? 'bg-green-500/6 border-green-500/20'
                            : pred.status === 'warn'
                              ? 'bg-amber-500/6 border-amber-500/20'
                              : 'bg-red-500/6 border-red-500/20'
                        }`}
                      >
                        <span className="text-xs font-medium flex-1">
                          {pred.label}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            pred.status === 'ok'
                              ? 'bg-green-500/15 text-green-700 dark:text-green-400'
                              : pred.status === 'warn'
                                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                                : 'bg-red-500/15 text-red-400'
                          }`}
                        >
                          {pred.badge}
                        </span>
                      </div>
                    )
                  )}
                </div>
              )}

              {card.infographic?.type === 'media' && (
                <div className="mt-4 bg-indigo-500/5 border-2 border-dashed border-indigo-500/20 rounded-xl flex flex-col items-center justify-center p-6 gap-2 text-center min-h-[80px]">
                  <div className="text-3xl opacity-40">🎬</div>
                  <div className="text-xs text-slate-500 font-medium">
                    {card.infographic.data?.placeholder || 'Media placeholder'}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
