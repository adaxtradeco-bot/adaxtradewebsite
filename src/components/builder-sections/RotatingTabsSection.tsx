/**
 * Rotating Tabs Section - AI Agent Phase 2
 * Author: Amazon Q
 * Created: 2024-01-20
 */
'use client';

import React, { useState, useEffect } from 'react';
import InfographicRenderer from './InfographicRenderer';

interface TabItem {
  tag: string;
  title: string;
  description: string;
  content: {
    tag: string;
    title: string;
    lead: string;
    example: string;
    infographic?: {
      type: string;
      data: any;
      mediaOverride?: {
        type: 'image' | 'video';
        src: string;
        alt?: string;
      };
    };
  };
}

interface RotatingTabsSectionProps {
  data: {
    eyebrow?: string;
    title?: string;
    highlightedTitle?: string;
    lead?: string;
    tabs?: TabItem[];
    autoRotate?: boolean;
    rotateInterval?: number;
  };
  style?: {
    backgroundColor?: string;
    textColor?: string;
    padding?: string;
  };
}

export default function RotatingTabsSection({
  data,
  style,
}: RotatingTabsSectionProps) {
  const tabs = data.tabs || [];
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (data.autoRotate !== false && tabs.length > 0) {
      const interval = setInterval(() => {
        setActiveTab((prev) => (prev + 1) % tabs.length);
      }, data.rotateInterval || 4000);
      return () => clearInterval(interval);
    }
  }, [data.autoRotate, data.rotateInterval, tabs.length]);

  return (
    <section
      className={`py-20 border-t border-b border-slate-200/70 dark:border-white/5 overflow-hidden ${style?.backgroundColor || 'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950'} ${style?.textColor || 'text-slate-900 dark:text-white'} ${style?.padding || ''}`}
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

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-16 items-start">
          {/* Tab Pills */}
          <div className="flex flex-col gap-1.5">
            {tabs.map((tab, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTab(idx)}
                className={`
                  text-left p-5 rounded-xl border transition-all duration-300
                  ${
                    activeTab === idx
                      ? 'bg-indigo-500/12 border-indigo-500/30'
                      : 'bg-slate-100 border-slate-200 hover:bg-slate-200 dark:bg-white/5 dark:border-white/5 dark:hover:bg-white/10'
                  }
                `}
              >
                <div
                  className={`text-[10px] font-semibold tracking-widest uppercase mb-1 ${activeTab === idx ? 'text-indigo-600 dark:text-indigo-300' : 'text-slate-500'}`}
                >
                  {tab.tag}
                </div>
                <div className="text-sm font-bold mb-1">{tab.title}</div>
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  {tab.description}
                </div>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="relative">
            {tabs.map((tab, idx) => (
              <div
                key={idx}
                className={`
                  transition-opacity duration-500
                  ${activeTab === idx ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'}
                `}
              >
                <div className="bg-white/80 dark:bg-slate-900/50 border border-slate-300/70 dark:border-white/20 rounded-2xl p-8 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500" />

                  <div className="text-[10px] font-semibold tracking-widest uppercase text-indigo-600 dark:text-indigo-300 mb-3">
                    {tab.content.tag}
                  </div>
                  <h3 className="text-xl font-extrabold mb-2 tracking-tight">
                    {tab.content.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-5">
                    {tab.content.lead}
                  </p>
                  <div className="text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 border-l-2 border-indigo-500/30 pl-3.5 pr-3 py-2.5 rounded-r-lg italic mb-5">
                    {tab.content.example}
                  </div>

                  {tab.content.infographic && (
                    <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4">
                      <InfographicRenderer infographic={tab.content.infographic} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
