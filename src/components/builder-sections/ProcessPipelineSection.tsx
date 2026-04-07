/**
 * Process Pipeline Section - Automated Workflow Visualization
 * Author: Amazon Q
 * Created: 2024-01-20
 */
'use client';

import React from 'react';

interface PipelineStep {
  number: string;
  title: string;
  description: string;
}

interface PipelineFeature {
  icon: string;
  title: string;
  description: string;
  color: 'indigo' | 'cyan' | 'green' | 'amber';
}

interface ProcessPipelineSectionProps {
  data: {
    eyebrow?: string;
    title?: string;
    highlightedTitle?: string;
    lead?: string;
    steps?: PipelineStep[];
    features?: PipelineFeature[];
  };
  style?: {
    backgroundColor?: string;
    textColor?: string;
    padding?: string;
  };
}

const featureColorClasses = {
  indigo: 'text-indigo-600 dark:text-indigo-300',
  cyan: 'text-cyan-700 dark:text-cyan-400',
  green: 'text-green-700 dark:text-green-400',
  amber: 'text-amber-700 dark:text-amber-400',
};

export default function ProcessPipelineSection({
  data,
  style,
}: ProcessPipelineSectionProps) {
  const steps = data.steps || [];
  const features = data.features || [];

  return (
    <section
      className={`py-20 border-t border-slate-200/70 dark:border-white/5 ${style?.backgroundColor || 'bg-gradient-to-br from-slate-900 to-slate-950 dark:from-slate-950 dark:to-black'} ${style?.textColor || 'text-slate-900 dark:text-white'} ${style?.padding || ''}`}
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
              {' '}
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

        {/* Pipeline Flow */}
        <div className="flex gap-4 overflow-x-auto pb-4 mb-12 scrollbar-thin scrollbar-thumb-indigo-500 scrollbar-track-slate-800">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="relative min-w-[220px] bg-slate-800/50 dark:bg-slate-900/50 border border-slate-700/50 dark:border-white/5 rounded-xl p-6 backdrop-blur-sm"
            >
              {/* Arrow */}
              {idx < steps.length - 1 && (
                <div className="absolute -right-5 top-1/2 -translate-y-1/2 text-2xl text-indigo-400 z-10">
                  →
                </div>
              )}

              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white flex items-center justify-center font-bold text-sm mb-3">
                {step.number}
              </div>
              <h3 className="text-base font-bold mb-2 text-white">
                {step.title}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        {features.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="bg-slate-800/30 dark:bg-slate-900/30 border border-slate-700/50 dark:border-white/5 rounded-xl p-5 backdrop-blur-sm hover:border-indigo-500/30 transition-all duration-300"
              >
                <h4
                  className={`text-base font-bold mb-2 flex items-center gap-2 ${featureColorClasses[feature.color]}`}
                >
                  <span className="text-xl">{feature.icon}</span>
                  {feature.title}
                </h4>
                <p className="text-sm text-slate-400 dark:text-slate-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
