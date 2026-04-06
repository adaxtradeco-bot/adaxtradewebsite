/**
 * Metro Grid Section - AI Agent Phase Display
 * Author: Amazon Q
 * Created: 2024-01-20
 */
'use client';

import React from 'react';

interface MetroCard {
  number: string;
  icon: string;
  tag: string;
  title: string;
  description: string;
  example?: string;
  infographic?: {
    type: 'flow' | 'org' | 'media';
    data?: any;
  };
  span?: 'wide' | 'tall' | 'normal';
  color: 'indigo' | 'cyan' | 'amber' | 'violet' | 'green';
}

interface MetroGridSectionProps {
  data: {
    eyebrow?: string;
    title?: string;
    highlightedTitle?: string;
    lead?: string;
    cards: MetroCard[];
  };
  style?: {
    backgroundColor?: string;
    textColor?: string;
    padding?: string;
  };
}

const colorClasses = {
  indigo: { border: 'before:bg-gradient-to-r before:from-indigo-500 before:to-violet-500', hover: 'hover:border-indigo-500/30' },
  cyan: { border: 'before:bg-gradient-to-r before:from-cyan-500 before:to-green-500', hover: 'hover:border-cyan-500/30' },
  amber: { border: 'before:bg-gradient-to-r before:from-amber-500 before:to-red-500', hover: 'hover:border-amber-500/30' },
  violet: { border: 'before:bg-gradient-to-r before:from-violet-500 before:to-pink-500', hover: 'hover:border-violet-500/30' },
  green: { border: 'before:bg-gradient-to-r before:from-green-500 before:to-cyan-500', hover: 'hover:border-green-500/30' },
};

export default function MetroGridSection({ data, style }: MetroGridSectionProps) {
  return (
    <section className={`py-20 border-t border-white/5 ${style?.backgroundColor || 'bg-slate-950'} ${style?.textColor || 'text-white'} ${style?.padding || ''}`}>
      <div className="max-w-6xl mx-auto px-8">
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

        {data.lead && (
          <p className="text-base text-slate-300 leading-relaxed max-w-2xl mb-12">
            {data.lead}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1">
          {data.cards.map((card, idx) => (
            <div
              key={idx}
              className={`
                relative bg-slate-900/50 border border-white/5 p-7 rounded-sm overflow-hidden transition-all duration-300 cursor-default
                ${card.span === 'wide' ? 'md:col-span-2' : ''}
                ${card.span === 'tall' ? 'md:row-span-2' : ''}
                ${colorClasses[card.color].hover}
                hover:bg-slate-800/50 hover:scale-[1.01]
                before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-0.5
                ${colorClasses[card.color].border}
              `}
            >
              <div className="absolute top-4 right-5 text-6xl font-black opacity-10 leading-none">
                {card.number}
              </div>

              <div className="text-3xl mb-4">{card.icon}</div>
              <div className="text-[10px] font-semibold tracking-widest uppercase text-slate-500 mb-2">
                {card.tag}
              </div>
              <h3 className="text-base font-bold mb-2">{card.title}</h3>
              <p className="text-sm text-slate-300 leading-relaxed">{card.description}</p>

              {card.example && (
                <div className="mt-4 text-xs text-slate-400 bg-white/5 border-l-2 border-indigo-500/30 pl-3 pr-2 py-2 rounded-r-md italic">
                  {card.example}
                </div>
              )}

              {card.infographic?.type === 'flow' && (
                <div className="flex items-center gap-1 flex-wrap mt-3">
                  {card.infographic.data?.steps?.map((step: string, i: number) => (
                    <React.Fragment key={i}>
                      <span className="bg-indigo-500/15 border border-indigo-500/25 rounded-md px-2.5 py-1 text-[10px] font-semibold text-indigo-300">
                        {step}
                      </span>
                      {i < card.infographic.data.steps.length - 1 && (
                        <span className="text-[10px] text-slate-500">→</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}

              {card.infographic?.type === 'org' && (
                <div className="flex flex-col items-center gap-1.5 mt-3">
                  <div className="bg-indigo-500/15 border border-indigo-500/30 rounded-md px-2.5 py-1 text-[10px] font-semibold text-indigo-300">
                    {card.infographic.data?.root}
                  </div>
                  <div className="w-px h-3 bg-white/10" />
                  <div className="flex gap-1.5">
                    {card.infographic.data?.children?.map((child: string, i: number) => (
                      <div key={i} className="bg-cyan-500/12 border border-cyan-500/25 rounded-md px-2.5 py-1 text-[10px] font-semibold text-cyan-400 text-center">
                        {child}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {card.infographic?.type === 'media' && (
                <div className="mt-4 bg-indigo-500/5 border-2 border-dashed border-indigo-500/20 rounded-xl flex flex-col items-center justify-center p-8 gap-2 text-center">
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
