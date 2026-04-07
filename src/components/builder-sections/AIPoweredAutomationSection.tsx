/**
 * AI Powered Automation Section
 * Author: Amazon Q
 * Created: 2024-01-20
 */
'use client';

import React from 'react';

interface AICapability {
  icon: string;
  tag: string;
  title: string;
  description: string;
  example: string;
  color: 'indigo' | 'cyan' | 'green' | 'violet';
}

interface AIPoweredAutomationSectionProps {
  data: {
    eyebrow?: string;
    title?: string;
    highlightedTitle?: string;
    lead?: string;
    capabilities?: AICapability[];
  };
  style?: {
    backgroundColor?: string;
    textColor?: string;
    padding?: string;
  };
}

const colorClasses = {
  indigo: {
    bg: 'bg-gradient-to-br from-indigo-500/20 to-indigo-500/5',
    text: 'text-indigo-600 dark:text-indigo-300',
    border: 'border-indigo-500/20',
    glow: 'hover:shadow-[0_0_30px_rgba(99,102,241,0.3)]',
  },
  cyan: {
    bg: 'bg-gradient-to-br from-cyan-500/20 to-cyan-500/5',
    text: 'text-cyan-700 dark:text-cyan-400',
    border: 'border-cyan-500/20',
    glow: 'hover:shadow-[0_0_30px_rgba(6,182,212,0.3)]',
  },
  green: {
    bg: 'bg-gradient-to-br from-green-500/20 to-green-500/5',
    text: 'text-green-700 dark:text-green-400',
    border: 'border-green-500/20',
    glow: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]',
  },
  violet: {
    bg: 'bg-gradient-to-br from-violet-500/20 to-violet-500/5',
    text: 'text-violet-700 dark:text-violet-300',
    border: 'border-violet-500/20',
    glow: 'hover:shadow-[0_0_30px_rgba(139,92,246,0.3)]',
  },
};

export default function AIPoweredAutomationSection({
  data,
  style,
}: AIPoweredAutomationSectionProps) {
  const capabilities = data.capabilities || [];

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {capabilities.map((capability, idx) => (
            <div
              key={idx}
              className={`relative bg-white/80 dark:bg-slate-900/50 border rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 ${colorClasses[capability.color].border} ${colorClasses[capability.color].glow}`}
            >
              {/* Gradient overlay */}
              <div
                className={`absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300 -z-10 ${colorClasses[capability.color].bg}`}
              />

              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl mb-4 ${colorClasses[capability.color].bg} border ${colorClasses[capability.color].border}`}
              >
                {capability.icon}
              </div>

              <div
                className={`text-xs font-bold tracking-widest uppercase mb-2 ${colorClasses[capability.color].text}`}
              >
                {capability.tag}
              </div>

              <h3 className="text-xl font-extrabold mb-3 tracking-tight">
                {capability.title}
              </h3>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                {capability.description}
              </p>

              <div className="bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-xs text-slate-600 dark:text-slate-400 font-mono">
                {capability.example}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
