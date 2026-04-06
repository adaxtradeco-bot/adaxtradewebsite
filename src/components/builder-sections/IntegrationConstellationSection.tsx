/**
 * Integration Constellation Section - Phase 4
 * Author: Amazon Q
 * Created: 2024-01-20
 */
'use client';

import React from 'react';

interface IntegrationCard {
  icon: string;
  title: string;
  tag: string;
  description: string;
  example: string;
}

interface IntegrationConstellationSectionProps {
  data: {
    eyebrow?: string;
    title?: string;
    highlightedTitle?: string;
    lead?: string;
    centerLabel?: string;
    innerNodes?: Array<{ label: string; angle: number }>;
    outerNodes?: Array<{ label: string; angle: number }>;
    cards: IntegrationCard[];
  };
  style?: {
    backgroundColor?: string;
    textColor?: string;
    padding?: string;
  };
}

export default function IntegrationConstellationSection({ data, style }: IntegrationConstellationSectionProps) {
  return (
    <section className={`py-20 border-t border-b border-white/5 ${style?.backgroundColor || 'bg-slate-900'} ${style?.textColor || 'text-white'} ${style?.padding || ''}`}>
      <div className="max-w-6xl mx-auto px-8">
        <div className="text-center mb-12">
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
            <p className="text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
              {data.lead}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-16 items-center">
          {/* SVG Orbit */}
          <div className="relative w-full max-w-[360px] h-[360px] mx-auto">
            <svg className="w-full h-full" viewBox="0 0 360 360" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="centerGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Orbit rings */}
              <circle cx="180" cy="180" r="140" fill="none" stroke="rgba(99,102,241,0.08)" strokeWidth="1" strokeDasharray="4 4" />
              <circle cx="180" cy="180" r="95" fill="none" stroke="rgba(6,182,212,0.08)" strokeWidth="1" strokeDasharray="3 3" />
              <circle cx="180" cy="180" r="50" fill="none" stroke="rgba(99,102,241,0.12)" strokeWidth="1" />

              {/* Center glow */}
              <circle cx="180" cy="180" r="50" fill="url(#centerGrad)" />

              {/* Center node */}
              <circle cx="180" cy="180" r="36" fill="rgba(99,102,241,0.15)" stroke="rgba(99,102,241,0.4)" strokeWidth="1.5" />
              <text x="180" y="175" textAnchor="middle" fill="#818cf8" fontSize="11" fontWeight="700" fontFamily="Inter,sans-serif">
                {data.centerLabel || 'IVAFLOW'}
              </text>
              <text x="180" y="191" textAnchor="middle" fill="#6366f1" fontSize="9" fontFamily="Inter,sans-serif">
                AI Core
              </text>

              {/* Inner orbit nodes */}
              {data.innerNodes?.map((node, idx) => {
                const angle = (node.angle * Math.PI) / 180;
                const x = 180 + 95 * Math.cos(angle - Math.PI / 2);
                const y = 180 + 95 * Math.sin(angle - Math.PI / 2);
                const colors = ['#06b6d4', '#a78bfa', '#10b981', '#f59e0b'];
                const color = colors[idx % colors.length];
                
                return (
                  <g key={idx}>
                    <line x1="180" y1="180" x2={x} y2={y} stroke={`${color}30`} strokeWidth="1" strokeDasharray="3 3" />
                    <circle cx={x} cy={y} r="22" fill={`${color}20`} stroke={`${color}60`} strokeWidth="1.5" />
                    <text x={x} y={y + 4} textAnchor="middle" fill={color} fontSize="9" fontWeight="600" fontFamily="Inter,sans-serif">
                      {node.label}
                    </text>
                  </g>
                );
              })}

              {/* Outer orbit nodes */}
              {data.outerNodes?.map((node, idx) => {
                const angle = (node.angle * Math.PI) / 180;
                const x = 180 + 140 * Math.cos(angle - Math.PI / 2);
                const y = 180 + 140 * Math.sin(angle - Math.PI / 2);
                const colors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#a78bfa', '#ec4899', '#6366f1'];
                const color = colors[idx % colors.length];
                
                return (
                  <g key={idx}>
                    <circle cx={x} cy={y} r="18" fill={`${color}20`} stroke={`${color}50`} strokeWidth="1" />
                    <text x={x} y={y + 4} textAnchor="middle" fill={color} fontSize="8" fontWeight="600" fontFamily="Inter,sans-serif">
                      {node.label}
                    </text>
                  </g>
                );
              })}

              {/* Animated pulse */}
              <circle cx="180" cy="180" r="36" fill="none" stroke="rgba(99,102,241,0.3)" strokeWidth="1">
                <animate attributeName="r" values="36;55;36" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.5;0;0.5" dur="3s" repeatCount="indefinite" />
              </circle>
            </svg>
          </div>

          {/* Integration Cards */}
          <div className="flex flex-col gap-2.5">
            {data.cards.map((card, idx) => (
              <div
                key={idx}
                className="bg-slate-900/50 border border-white/5 rounded-xl p-5 transition-all duration-300 hover:border-cyan-500/30"
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base bg-cyan-500/12 border border-cyan-500/20">
                    {card.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">{card.title}</h3>
                    <div className="text-[10px] text-slate-500 font-medium">{card.tag}</div>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mb-2">
                  {card.description}
                </p>
                <div className="text-xs text-slate-400 italic border-l-2 border-cyan-500/25 pl-2 mt-2">
                  {card.example}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
