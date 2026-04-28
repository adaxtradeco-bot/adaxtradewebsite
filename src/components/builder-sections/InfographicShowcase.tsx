/**
 * Infographic Showcase Section
 * Author: Kiro AI
 * Created: 2025-01-XX
 * 
 * Purpose: Demo section showing infographic with advanced theme and animation
 */
'use client';

import React from 'react';
import InfographicRenderer, { InfographicData } from './InfographicRenderer';

interface InfographicShowcaseSectionProps {
  data: {
    eyebrow?: string;
    title?: string;
    description?: string;
    infographics?: InfographicData[];
  };
}

export default function InfographicShowcaseSection({
  data,
}: InfographicShowcaseSectionProps) {
  const infographics = data.infographics || [];

  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-6xl mx-auto px-8">
        {data.eyebrow && (
          <div className="text-xs font-semibold tracking-widest uppercase text-indigo-600 dark:text-indigo-300 mb-3">
            {data.eyebrow}
          </div>
        )}

        {data.title && (
          <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-3 text-slate-900 dark:text-white">
            {data.title}
          </h2>
        )}

        {data.description && (
          <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mb-12">
            {data.description}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {infographics.map((infographic, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800"
            >
              <InfographicRenderer infographic={infographic} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
