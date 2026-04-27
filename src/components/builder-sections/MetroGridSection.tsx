/**
 * Metro Grid Section - AI Agent Phase Display
 * Author: Amazon Q
 * Created: 2024-01-20
 * Updated: 2025-01-XX - Added IconFieldEditor support and image position
 */

'use client';

import React from 'react';
import InfographicRenderer from './InfographicRenderer';
import { IconConfig, IconDisplay } from '@/components/ui/IconPicker';

interface MetroCard {
  number: string;
  icon: string | IconConfig;
  tag: string;
  title: string;
  description: string;
  example?: string;
  image?: string;
  imagePosition?: 'top' | 'bottom';
  infographic?: {
    type: string;
    data?: any;
    mediaOverride?: {
      type: 'image' | 'video';
      src: string;
      alt?: string;
    };
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
    cards?: MetroCard[];
  };
  style?: {
    backgroundColor?: string;
    textColor?: string;
    padding?: string;
  };
}

const colorClasses = {
  indigo: {
    border:
      'before:bg-gradient-to-r before:from-indigo-500 before:to-violet-500',
    hover: 'hover:border-indigo-500/30',
  },
  cyan: {
    border: 'before:bg-gradient-to-r before:from-cyan-500 before:to-green-500',
    hover: 'hover:border-cyan-500/30',
  },
  amber: {
    border: 'before:bg-gradient-to-r before:from-amber-500 before:to-red-500',
    hover: 'hover:border-amber-500/30',
  },
  violet: {
    border: 'before:bg-gradient-to-r before:from-violet-500 before:to-pink-500',
    hover: 'hover:border-violet-500/30',
  },
  green: {
    border: 'before:bg-gradient-to-r before:from-green-500 before:to-cyan-500',
    hover: 'hover:border-green-500/30',
  },
};

export default function MetroGridSection({
  data,
  style,
}: MetroGridSectionProps) {
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1">
          {cards.map((card, idx) => (
            <div
              key={idx}
              className={`
                relative bg-white/80 dark:bg-slate-900/50 border border-slate-200/70 dark:border-white/5 p-7 rounded-sm overflow-hidden transition-all duration-300 cursor-default
                ${card.span === 'wide' ? 'md:col-span-2' : ''}
                ${card.span === 'tall' ? 'md:row-span-2' : ''}
                ${colorClasses[card.color].hover}
                hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:scale-[1.01]
                before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-0.5
                ${colorClasses[card.color].border}
              `}
            >
              <div className="absolute top-4 right-5 text-6xl font-black opacity-10 leading-none">
                {card.number}
              </div>

              <div className="text-3xl mb-4">
                {typeof card.icon === 'string' ? card.icon : <IconDisplay icon={card.icon} className="w-8 h-8" />}
              </div>
              <div className="text-[10px] font-semibold tracking-widest uppercase text-slate-500 mb-2">
                {card.tag}
              </div>
              <h3 className="text-base font-bold mb-2">{card.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {card.description}
              </p>

              {/* Image at top */}
              {card.image && card.imagePosition === 'top' && (
                <div className="mt-3">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-24 object-cover rounded"
                  />
                </div>
              )}

              {card.example && (
                <div className="mt-4 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 border-l-2 border-indigo-500/30 pl-3 pr-2 py-2 rounded-r-md italic">
                  {card.example}
                </div>
              )}

              {/* Image at bottom */}
              {card.image && card.imagePosition === 'bottom' && (
                <div className="mt-3">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-24 object-cover rounded"
                  />
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
