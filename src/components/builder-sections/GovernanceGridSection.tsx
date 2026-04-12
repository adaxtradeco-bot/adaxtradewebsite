/**
 * Governance Grid Section - Phase 7
 * Author: Amazon Q
 * Created: 2024-01-20
 */
'use client';

import React from 'react';

interface GovernanceCard {
  tag: string;
  title: string;
  description: string;
  example: string;
  color: 'green' | 'indigo' | 'amber' | 'cyan' | 'violet';
  infographic?: {
    type: 'audit' | 'roles' | 'exception' | 'stats' | 'flow' | 'timeline' | 'exception-alert' | 'role-levels';
    data?: any;
  };
}

interface GovernanceGridSectionProps {
  data: {
    eyebrow?: string;
    title?: string;
    highlightedTitle?: string;
    lead?: string;
    cards?: GovernanceCard[];
  };
  style?: {
    backgroundColor?: string;
    textColor?: string;
    padding?: string;
  };
}

const colorClasses = {
  green: 'before:bg-gradient-to-r before:from-green-500 before:to-cyan-500',
  indigo: 'before:bg-gradient-to-r before:from-indigo-500 before:to-violet-500',
  amber: 'before:bg-gradient-to-r before:from-amber-500 before:to-red-500',
  cyan: 'before:bg-gradient-to-r before:from-cyan-500 before:to-blue-500',
  violet: 'before:bg-gradient-to-r before:from-violet-500 before:to-purple-500',
};

export default function GovernanceGridSection({
  data,
  style,
}: GovernanceGridSectionProps) {
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {cards.map((card, idx) => (
            <div
              key={idx}
              className={`
                bg-white/80 dark:bg-slate-900/50 border border-slate-200/70 dark:border-white/5 rounded-2xl p-6 transition-all duration-300
                hover:border-green-500/30 hover:-translate-y-0.5
                before:content-[''] before:block before:w-full before:h-0.5 before:rounded-sm before:mb-5
                ${colorClasses[card.color]}
              `}
            >
              <div className="text-[10px] font-semibold tracking-widest uppercase text-slate-500 mb-2">
                {card.tag}
              </div>
              <h3 className="text-base font-bold mb-2">{card.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                {card.description}
              </p>
              <div className="text-xs text-slate-500 dark:text-slate-400 italic border-l-2 border-green-500/25 pl-2.5">
                {card.example}
              </div>

              {card.infographic?.type === 'audit' && (
                <div className="mt-3 flex flex-col gap-1.5">
                  {card.infographic.data?.trail?.map((item: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <div
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          item.type === 'success'
                            ? 'bg-green-500'
                            : item.type === 'ai'
                              ? 'bg-indigo-400'
                              : item.type === 'warning'
                                ? 'bg-amber-500'
                                : item.type === 'error'
                                  ? 'bg-red-500'
                                  : 'bg-cyan-500'
                        }`}
                      />
                      <span className="flex-1 text-slate-600 dark:text-slate-300">
                        {item.action}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {item.time}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {card.infographic?.type === 'roles' && (
                <div className="mt-3 flex flex-col gap-1.5">
                  {card.infographic.data?.roles?.map((role: any, i: number) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2 p-2 rounded-lg border ${
                        role.level === 'admin'
                          ? 'bg-indigo-500/7 border-indigo-500/15'
                          : role.level === 'manager'
                            ? 'bg-cyan-500/7 border-cyan-500/15'
                            : 'bg-green-500/7 border-green-500/15'
                      }`}
                    >
                      <span
                        className={`text-xs font-semibold ${
                          role.level === 'admin'
                            ? 'text-indigo-600 dark:text-indigo-300'
                            : role.level === 'manager'
                              ? 'text-cyan-700 dark:text-cyan-400'
                              : 'text-green-700 dark:text-green-400'
                        }`}
                      >
                        {role.name}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {role.access}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {card.infographic?.type === 'exception' && (
                <div className="mt-3">
                  <div className="flex items-center gap-2 p-2 bg-red-500/7 border border-red-500/20 rounded-lg">
                    <span className="text-base">⚠</span>
                    <div>
                      <div className="text-xs font-semibold text-red-400">
                        {card.infographic.data?.title}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        {card.infographic.data?.description}
                      </div>
                    </div>
                    <span className="ml-auto text-[10px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-500/12 px-2 py-0.5 rounded-full">
                      {card.infographic.data?.badge}
                    </span>
                  </div>
                </div>
              )}

              {card.infographic?.type === 'stats' && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {card.infographic.data?.metrics?.map((metric: any, i: number) => (
                    <div key={i} className="p-2 bg-slate-100/50 dark:bg-slate-800/30 rounded-lg border border-slate-200/50 dark:border-white/5">
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">
                        {metric.label}
                      </div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        {metric.value}
                      </div>
                      <div className={`text-[10px] flex items-center gap-1 ${
                        metric.trend === 'up' ? 'text-green-600 dark:text-green-400' :
                        metric.trend === 'down' ? 'text-red-600 dark:text-red-400' :
                        'text-slate-500 dark:text-slate-400'
                      }`}>
                        {metric.trend === 'up' && '↑'}
                        {metric.trend === 'down' && '↓'}
                        {metric.trend === 'neutral' && '→'}
                        <span>{metric.change}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {card.infographic?.type === 'flow' && (
                <div className="mt-3 flex flex-col gap-1">
                  {card.infographic.data?.nodes?.map((node: any, i: number) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                        node.type === 'start' ? 'bg-green-500/20 text-green-700 dark:text-green-300' :
                        node.type === 'end' ? 'bg-red-500/20 text-red-700 dark:text-red-300' :
                        node.type === 'decision' ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300' :
                        'bg-blue-500/20 text-blue-700 dark:text-blue-300'
                      }`}>
                        {i + 1}
                      </div>
                      <span className="text-xs text-slate-600 dark:text-slate-300">
                        {node.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {card.infographic?.type === 'timeline' && (
                <div className="mt-3 flex flex-col gap-1.5">
                  {card.infographic.data?.steps?.map((step: any, i: number) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${
                        step.status === 'completed' ? 'bg-green-500' :
                        step.status === 'active' ? 'bg-blue-500 animate-pulse' :
                        'bg-slate-300 dark:bg-slate-600'
                      }`} />
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-slate-900 dark:text-white">
                          {step.title}
                        </div>
                        {step.description && (
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">
                            {step.description}
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        {step.time}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {card.infographic?.type === 'exception-alert' && (
                <div style={{ marginTop: '.75rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      background: 'rgba(239,68,68,.07)',
                      border: '1px solid rgba(239,68,68,.2)',
                      borderRadius: '8px',
                    }}
                  >
                    <span style={{ fontSize: '16px' }}>⚠</span>
                    <div>
                      <div
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          color: card.infographic.data?.statusColor === 'red' ? 'var(--red, #ef4444)' : 'var(--amber, #f59e0b)',
                        }}
                      >
                        {card.infographic.data?.status}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text3, #94a3b8)' }}>
                        {card.infographic.data?.detail}
                      </div>
                    </div>
                    <span
                      style={{
                        marginLeft: 'auto',
                        fontSize: '10px',
                        fontWeight: 600,
                        color:
                          card.infographic.data?.badgeColor === 'amber'
                            ? 'var(--amber, #f59e0b)'
                            : card.infographic.data?.badgeColor === 'green'
                              ? 'var(--green, #10b981)'
                              : 'var(--cyan, #06b6d4)',
                        background:
                          card.infographic.data?.badgeColor === 'amber'
                            ? 'rgba(245,158,11,.12)'
                            : card.infographic.data?.badgeColor === 'green'
                              ? 'rgba(16,185,129,.12)'
                              : 'rgba(6,182,212,.12)',
                        padding: '2px 8px',
                        borderRadius: '100px',
                      }}
                    >
                      {card.infographic.data?.badge}
                    </span>
                  </div>
                </div>
              )}

              {card.infographic?.type === 'role-levels' && (
                <div style={{ marginTop: '.75rem', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {card.infographic.data?.roles?.map((role: any, i: number) => {
                    const colorMap = {
                      indigo: {
                        bg: 'rgba(99,102,241,.07)',
                        border: 'rgba(99,102,241,.15)',
                        text: 'var(--accent2, #6366f1)',
                      },
                      cyan: {
                        bg: 'rgba(6,182,212,.07)',
                        border: 'rgba(6,182,212,.15)',
                        text: 'var(--cyan, #06b6d4)',
                      },
                      green: {
                        bg: 'rgba(16,185,129,.07)',
                        border: 'rgba(16,185,129,.15)',
                        text: 'var(--green, #10b981)',
                      },
                      amber: {
                        bg: 'rgba(245,158,11,.07)',
                        border: 'rgba(245,158,11,.15)',
                        text: 'var(--amber, #f59e0b)',
                      },
                      violet: {
                        bg: 'rgba(139,92,246,.07)',
                        border: 'rgba(139,92,246,.15)',
                        text: 'var(--violet, #8b5cf6)',
                      },
                    };
                    const colors = colorMap[role.color as keyof typeof colorMap] || colorMap.indigo;

                    return (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '7px 10px',
                          background: colors.bg,
                          border: `1px solid ${colors.border}`,
                          borderRadius: '6px',
                        }}
                      >
                        <span style={{ fontSize: '11px', color: colors.text, fontWeight: 600 }}>
                          {role.role}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text3, #94a3b8)' }}>
                          {role.description}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
