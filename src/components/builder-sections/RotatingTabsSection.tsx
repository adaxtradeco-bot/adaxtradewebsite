/**
 * Rotating Tabs Section - AI Agent Phase 2
 * Author: Amazon Q
 * Created: 2024-01-20
 */
'use client';

import React, { useState, useEffect } from 'react';

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
      type: 'workflow' | 'sla' | 'adaptive';
      data: any;
    };
  };
}

interface RotatingTabsSectionProps {
  data: {
    eyebrow?: string;
    title?: string;
    highlightedTitle?: string;
    lead?: string;
    tabs: TabItem[];
    autoRotate?: boolean;
    rotateInterval?: number;
  };
  style?: {
    backgroundColor?: string;
    textColor?: string;
    padding?: string;
  };
}

export default function RotatingTabsSection({ data, style }: RotatingTabsSectionProps) {
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (data.autoRotate !== false) {
      const interval = setInterval(() => {
        setActiveTab((prev) => (prev + 1) % data.tabs.length);
      }, data.rotateInterval || 4000);
      return () => clearInterval(interval);
    }
  }, [data.autoRotate, data.rotateInterval, data.tabs.length]);

  return (
    <section className={`py-20 border-t border-b border-white/5 overflow-hidden ${style?.backgroundColor || 'bg-gradient-to-br from-slate-900 to-slate-950'} ${style?.textColor || 'text-white'} ${style?.padding || ''}`}>
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

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-16 items-start">
          {/* Tab Pills */}
          <div className="flex flex-col gap-1.5">
            {data.tabs.map((tab, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTab(idx)}
                className={`
                  text-left p-5 rounded-xl border transition-all duration-300
                  ${activeTab === idx
                    ? 'bg-indigo-500/12 border-indigo-500/30'
                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                  }
                `}
              >
                <div className={`text-[10px] font-semibold tracking-widest uppercase mb-1 ${activeTab === idx ? 'text-indigo-300' : 'text-slate-500'}`}>
                  {tab.tag}
                </div>
                <div className="text-sm font-bold mb-1">{tab.title}</div>
                <div className="text-xs text-slate-300">{tab.description}</div>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="relative">
            {data.tabs.map((tab, idx) => (
              <div
                key={idx}
                className={`
                  transition-opacity duration-500
                  ${activeTab === idx ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'}
                `}
              >
                <div className="bg-slate-900/50 border border-white/20 rounded-2xl p-8 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500" />

                  <div className="text-[10px] font-semibold tracking-widest uppercase text-indigo-300 mb-3">
                    {tab.content.tag}
                  </div>
                  <h3 className="text-xl font-extrabold mb-2 tracking-tight">
                    {tab.content.title}
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed mb-5">
                    {tab.content.lead}
                  </p>
                  <div className="text-sm text-slate-400 bg-white/5 border-l-2 border-indigo-500/30 pl-3.5 pr-3 py-2.5 rounded-r-lg italic mb-5">
                    {tab.content.example}
                  </div>

                  {tab.content.infographic && (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      {tab.content.infographic.type === 'workflow' && (
                        <div>
                          <div className="text-xs font-semibold text-slate-400 mb-3">
                            {tab.content.infographic.data.title}
                          </div>
                          <div className="flex flex-col gap-1.5">
                            {tab.content.infographic.data.steps?.map((step: any, i: number) => (
                              <div key={i} className="flex items-center gap-2.5 p-2 bg-indigo-500/8 rounded-lg border border-indigo-500/15">
                                <div className="w-5.5 h-5.5 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                                  {step.num}
                                </div>
                                <div className="text-xs font-medium flex-1">{step.label}</div>
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                  step.type === 'auto' ? 'bg-green-500/15 text-green-400' :
                                  step.type === 'ai' ? 'bg-indigo-500/15 text-indigo-300' :
                                  step.type === 'conditional' ? 'bg-amber-500/15 text-amber-400' :
                                  'bg-cyan-500/15 text-cyan-400'
                                }`}>
                                  {step.badge}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {tab.content.infographic.type === 'sla' && (
                        <div>
                          <div className="text-xs font-semibold text-slate-400 mb-3">
                            {tab.content.infographic.data.title}
                          </div>
                          <div className="flex flex-col gap-2">
                            {tab.content.infographic.data.bars?.map((bar: any, i: number) => (
                              <div key={i} className="flex items-center gap-2.5">
                                <span className="text-xs text-slate-300 w-20 flex-shrink-0">{bar.label}</span>
                                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-1000 ${
                                      bar.value >= 90 ? 'bg-green-500' :
                                      bar.value >= 70 ? 'bg-amber-500' :
                                      'bg-red-500'
                                    }`}
                                    style={{ width: `${bar.value}%` }}
                                  />
                                </div>
                                <span className={`text-[10px] font-semibold w-8 text-right ${
                                  bar.value >= 90 ? 'text-green-400' :
                                  bar.value >= 70 ? 'text-amber-400' :
                                  'text-red-400'
                                }`}>
                                  {bar.value}%
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
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
