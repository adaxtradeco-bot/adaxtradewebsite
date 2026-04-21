/**
 * Infographic Renderer - Centralized Infographic System
 * Author: Amazon Q
 * Created: 2024-01-20
 * 
 * Purpose: Universal infographic renderer for all section types
 * Supports: All infographic types + image/video fallback
 */
'use client';

import React from 'react';

export interface InfographicData {
  type: string;
  data?: any;
  // Optional: Override with image or video
  mediaOverride?: {
    type: 'image' | 'video';
    src: string;
    alt?: string;
  };
}

interface InfographicRendererProps {
  infographic: InfographicData;
  className?: string;
}

export default function InfographicRenderer({
  infographic,
  className = '',
}: InfographicRendererProps) {
  // If media override exists, render image/video instead
  if (infographic.mediaOverride) {
    if (infographic.mediaOverride.type === 'image') {
      return (
        <div className={`mt-3 ${className}`}>
          <img
            src={infographic.mediaOverride.src}
            alt={infographic.mediaOverride.alt || 'Infographic'}
            className="w-full h-auto rounded-lg"
          />
        </div>
      );
    }
    if (infographic.mediaOverride.type === 'video') {
      return (
        <div className={`mt-3 ${className}`}>
          <video
            src={infographic.mediaOverride.src}
            controls
            className="w-full h-auto rounded-lg"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }
  }

  // Render based on infographic type
  switch (infographic.type) {
    // ==================== GOVERNANCE TYPES ====================
    case 'audit':
      return (
        <div className={`mt-3 flex flex-col gap-1.5 ${className}`}>
          {infographic.data?.trail?.map((item: any, i: number) => (
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
              <span className="text-[10px] text-slate-500">{item.time}</span>
            </div>
          ))}
        </div>
      );

    case 'roles':
      return (
        <div className={`mt-3 flex flex-col gap-1.5 ${className}`}>
          {infographic.data?.roles?.map((role: any, i: number) => (
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
      );

    case 'exception':
      return (
        <div className={`mt-3 ${className}`}>
          <div className="flex items-center gap-2 p-2 bg-red-500/7 border border-red-500/20 rounded-lg">
            <span className="text-base">⚠</span>
            <div>
              <div className="text-xs font-semibold text-red-400">
                {infographic.data?.title}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                {infographic.data?.description}
              </div>
            </div>
            <span className="ml-auto text-[10px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-500/12 px-2 py-0.5 rounded-full">
              {infographic.data?.badge}
            </span>
          </div>
        </div>
      );

    case 'exception-alert':
      return (
        <div style={{ marginTop: '.75rem' }} className={className}>
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
                  color:
                    infographic.data?.statusColor === 'red'
                      ? 'var(--red, #ef4444)'
                      : 'var(--amber, #f59e0b)',
                }}
              >
                {infographic.data?.status}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text3, #94a3b8)' }}>
                {infographic.data?.detail}
              </div>
            </div>
            <span
              style={{
                marginLeft: 'auto',
                fontSize: '10px',
                fontWeight: 600,
                color:
                  infographic.data?.badgeColor === 'amber'
                    ? 'var(--amber, #f59e0b)'
                    : infographic.data?.badgeColor === 'green'
                      ? 'var(--green, #10b981)'
                      : 'var(--cyan, #06b6d4)',
                background:
                  infographic.data?.badgeColor === 'amber'
                    ? 'rgba(245,158,11,.12)'
                    : infographic.data?.badgeColor === 'green'
                      ? 'rgba(16,185,129,.12)'
                      : 'rgba(6,182,212,.12)',
                padding: '2px 8px',
                borderRadius: '100px',
              }}
            >
              {infographic.data?.badge}
            </span>
          </div>
        </div>
      );

    case 'role-levels':
      return (
        <div
          style={{
            marginTop: '.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',
          }}
          className={className}
        >
          {infographic.data?.roles?.map((role: any, i: number) => {
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
            const colors =
              colorMap[role.color as keyof typeof colorMap] || colorMap.indigo;

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
                <span
                  style={{ fontSize: '11px', color: colors.text, fontWeight: 600 }}
                >
                  {role.role}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text3, #94a3b8)' }}>
                  {role.description}
                </span>
              </div>
            );
          })}
        </div>
      );

    case 'stats':
      return (
        <div className={`mt-3 grid grid-cols-2 gap-2 ${className}`}>
          {infographic.data?.metrics?.map((metric: any, i: number) => (
            <div
              key={i}
              className="p-2 bg-slate-100/50 dark:bg-slate-800/30 rounded-lg border border-slate-200/50 dark:border-white/5"
            >
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">
                {metric.label}
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {metric.value}
              </div>
              <div
                className={`text-[10px] flex items-center gap-1 ${
                  metric.trend === 'up'
                    ? 'text-green-600 dark:text-green-400'
                    : metric.trend === 'down'
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {metric.trend === 'up' && '↑'}
                {metric.trend === 'down' && '↓'}
                {metric.trend === 'neutral' && '→'}
                <span>{metric.change}</span>
              </div>
            </div>
          ))}
        </div>
      );

    case 'flow':
      return (
        <div className={`mt-3 flex flex-col gap-1 ${className}`}>
          {infographic.data?.nodes?.map((node: any, i: number) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                  node.type === 'start'
                    ? 'bg-green-500/20 text-green-700 dark:text-green-300'
                    : node.type === 'end'
                      ? 'bg-red-500/20 text-red-700 dark:text-red-300'
                      : node.type === 'decision'
                        ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                        : 'bg-blue-500/20 text-blue-700 dark:text-blue-300'
                }`}
              >
                {i + 1}
              </div>
              <span className="text-xs text-slate-600 dark:text-slate-300">
                {node.label}
              </span>
            </div>
          ))}
        </div>
      );

    case 'timeline':
      return (
        <div className={`mt-3 flex flex-col gap-1.5 ${className}`}>
          {infographic.data?.steps?.map((step: any, i: number) => (
            <div key={i} className="flex items-start gap-2">
              <div
                className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${
                  step.status === 'completed'
                    ? 'bg-green-500'
                    : step.status === 'active'
                      ? 'bg-blue-500 animate-pulse'
                      : 'bg-slate-300 dark:bg-slate-600'
                }`}
              />
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
      );

    case 'event-flow':
      return (
        <div className={`flex flex-col gap-0 mt-1 ${className}`}>
          {infographic.data?.steps?.map((step: any, idx: number) => (
            <div key={step.id || idx} className="flex items-stretch gap-0">
              {/* Left: dot + line */}
              <div className="flex flex-col items-center w-8 flex-shrink-0">
                <div
                  className="w-2.5 h-2.5 rounded-full border-2 flex-shrink-0 mt-3.5 relative z-10"
                  style={{
                    borderColor: infographic.data?.color || '#4F7FFF',
                    background: 'var(--bg-panel, #151720)'
                  }}
                />
                {idx < (infographic.data?.steps?.length || 0) - 1 && (
                  <div className="flex-1 w-px bg-white/10 mt-0.5 -mb-0.5" />
                )}
              </div>

              {/* Right: content */}
              <div className="flex-1 py-2.5 px-4 pb-4">
                <div
                  className="font-mono text-[10px] uppercase tracking-[0.08em] mb-1"
                  style={{ color: `${infographic.data?.color || '#4F7FFF'}B3` }}
                >
                  {step.label}
                </div>
                <div
                  className="text-[13px] leading-[1.5]"
                  style={{ color: 'rgba(255,255,255,0.75)' }}
                  dangerouslySetInnerHTML={{ __html: step.text }}
                />
              </div>
            </div>
          ))}
        </div>
      );

    // ==================== ANALYTICS TYPES ====================
    case 'kpi':
      return (
        <div className={`grid grid-cols-2 gap-1.5 mt-3 ${className}`}>
          {infographic.data?.kpis?.map((kpi: any, i: number) => (
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
              <div className="text-[10px] text-slate-500 mt-0.5">{kpi.label}</div>
            </div>
          ))}
        </div>
      );

    case 'performance':
      return (
        <div className={`mt-3 flex flex-col gap-1.5 ${className}`}>
          {infographic.data?.performers?.map((perf: any, i: number) => (
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
          ))}
        </div>
      );

    case 'performance-bars':
      return (
        <div
          style={{
            marginTop: '.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',
          }}
          className={className}
        >
          {infographic.data?.performers?.map((perf: any, i: number) => {
            const colorMap = {
              green: 'var(--green, #10b981)',
              cyan: 'var(--cyan, #06b6d4)',
              amber: 'var(--amber, #f59e0b)',
              indigo: 'var(--indigo, #6366f1)',
              violet: 'var(--violet, #8b5cf6)',
            };
            const barColor =
              colorMap[perf.color as keyof typeof colorMap] || colorMap.green;

            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    fontSize: '11px',
                    color: 'var(--text2, #64748b)',
                    width: '60px',
                  }}
                >
                  {perf.name}
                </div>
                <div
                  style={{
                    flex: 1,
                    height: '6px',
                    background: 'rgba(255,255,255,.06)',
                    borderRadius: '3px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${perf.score}%`,
                      background: barColor,
                      borderRadius: '3px',
                    }}
                  />
                </div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: barColor }}>
                  {perf.score}
                </div>
              </div>
            );
          })}
        </div>
      );

    case 'prediction':
      return (
        <div className={`mt-3 flex flex-col gap-1.5 ${className}`}>
          {infographic.data?.predictions?.map((pred: any, i: number) => (
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
              <span className="text-xs font-medium flex-1">{pred.label}</span>
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
          ))}
        </div>
      );

    case 'status-list':
      return (
        <div
          style={{
            marginTop: '.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
          className={className}
        >
          {infographic.data?.items?.map((item: any, i: number) => {
            const colorMap = {
              red: {
                bg: 'rgba(239,68,68,.07)',
                border: 'rgba(239,68,68,.2)',
                dot: 'var(--red, #ef4444)',
                text: 'var(--red, #ef4444)',
              },
              amber: {
                bg: 'rgba(245,158,11,.07)',
                border: 'rgba(245,158,11,.2)',
                dot: 'var(--amber, #f59e0b)',
                text: 'var(--amber, #f59e0b)',
              },
              green: {
                bg: 'rgba(16,185,129,.07)',
                border: 'rgba(16,185,129,.2)',
                dot: 'var(--green, #10b981)',
                text: 'var(--green, #10b981)',
              },
            };
            const colors =
              colorMap[item.color as keyof typeof colorMap] || colorMap.green;

            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 10px',
                  background: colors.bg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '6px',
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: colors.dot,
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: '11px', color: 'var(--text2, #64748b)' }}>
                  {item.label}
                </span>
                <span
                  style={{
                    marginLeft: 'auto',
                    fontSize: '10px',
                    fontWeight: 700,
                    color: colors.text,
                  }}
                >
                  {item.status}
                </span>
              </div>
            );
          })}
        </div>
      );

    case 'media':
      const mediaData = infographic.data;
      if (!mediaData?.src) {
        return (
          <div
            className={`mt-4 bg-purple-500/5 border-2 border-dashed border-purple-500/20 rounded-xl flex flex-col items-center justify-center p-6 gap-2 text-center min-h-[80px] ${className}`}
          >
            <div className="text-3xl opacity-40">📷</div>
            <div className="text-xs text-slate-500 font-medium">
              No media selected
            </div>
          </div>
        );
      }

      const isVideo = mediaData.type === 'video' || mediaData.src?.match(/\.(mp4|webm|mov)$/i);
      
      return (
        <div className={`mt-3 ${className}`}>
          {isVideo ? (
            <video
              src={mediaData.src}
              controls
              className="w-full h-auto rounded-lg"
              style={{
                maxWidth: mediaData.maxWidth ? `${mediaData.maxWidth}px` : undefined,
                maxHeight: mediaData.maxHeight ? `${mediaData.maxHeight}px` : undefined,
                objectFit: mediaData.objectFit || 'cover'
              }}
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <img
              src={mediaData.src}
              alt={mediaData.alt || 'Media'}
              className="w-full h-auto rounded-lg"
              style={{
                maxWidth: mediaData.maxWidth ? `${mediaData.maxWidth}px` : undefined,
                maxHeight: mediaData.maxHeight ? `${mediaData.maxHeight}px` : undefined,
                objectFit: mediaData.objectFit || 'cover'
              }}
            />
          )}
        </div>
      );

    // ==================== ROTATING TABS TYPES ====================
    case 'workflow':
      return (
        <div className={className}>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">
            {infographic.data?.title}
          </div>
          <div className="flex flex-col gap-1.5">
            {infographic.data?.steps?.map((step: any, i: number) => (
              <div
                key={i}
                className="flex items-center gap-2.5 p-2 bg-indigo-500/8 rounded-lg border border-indigo-500/15"
              >
                <div className="w-5.5 h-5.5 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                  {step.num}
                </div>
                <div className="text-xs font-medium flex-1">{step.label}</div>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    step.type === 'auto'
                      ? 'bg-green-500/15 text-green-700 dark:text-green-400'
                      : step.type === 'ai'
                        ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300'
                        : step.type === 'conditional'
                          ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                          : 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-400'
                  }`}
                >
                  {step.badge}
                </span>
              </div>
            ))}
          </div>
        </div>
      );

    case 'sla':
      return (
        <div className={className}>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">
            {infographic.data?.title}
          </div>
          <div className="flex flex-col gap-2">
            {infographic.data?.bars?.map((bar: any, i: number) => (
              <div key={i} className="flex items-center gap-2.5">
                <span className="text-xs text-slate-600 dark:text-slate-300 w-20 flex-shrink-0">
                  {bar.label}
                </span>
                <div className="flex-1 h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      bar.value >= 90
                        ? 'bg-green-500'
                        : bar.value >= 70
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                    }`}
                    style={{ width: `${bar.value}%` }}
                  />
                </div>
                <span
                  className={`text-[10px] font-semibold w-8 text-right ${
                    bar.value >= 90
                      ? 'text-green-700 dark:text-green-400'
                      : bar.value >= 70
                        ? 'text-amber-700 dark:text-amber-400'
                        : 'text-red-400'
                  }`}
                >
                  {bar.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      );

    case 'sla-bars':
      return (
        <div className={`tpc-infographic ${className}`}>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--text3)',
              marginBottom: '.75rem',
            }}
          >
            {infographic.data?.title}
          </div>
          <div className="sla-bars flex flex-col gap-2">
            {infographic.data?.bars?.map((bar: any, i: number) => {
              const statusColors = {
                green: 'var(--green, #10b981)',
                amber: 'var(--amber, #f59e0b)',
                red: 'var(--red, #ef4444)',
              };
              const barColor =
                statusColors[bar.status as keyof typeof statusColors] ||
                statusColors.green;

              return (
                <div key={i} className="sla-row flex items-center gap-2">
                  <span className="sla-label text-xs text-slate-600 dark:text-slate-300 w-24 flex-shrink-0">
                    {bar.label}
                  </span>
                  <div className="sla-bar-wrap flex-1 h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="sla-bar h-full rounded-full transition-all duration-1000"
                      style={{ width: `${bar.value}%`, background: barColor }}
                    />
                  </div>
                  <span
                    className="sla-val text-xs font-semibold w-10 text-right"
                    style={{ color: barColor }}
                  >
                    {bar.value}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );

    // ==================== METRO GRID TYPES ====================
    case 'org':
      return (
        <div className={`flex flex-col items-center gap-1.5 mt-3 ${className}`}>
          <div className="bg-indigo-500/15 border border-indigo-500/30 rounded-md px-2.5 py-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-300">
            {infographic.data?.root}
          </div>
          <div className="w-px h-3 bg-slate-300 dark:bg-white/10" />
          <div className="flex gap-1.5">
            {infographic.data?.children?.map((child: string, i: number) => (
              <div
                key={i}
                className="bg-cyan-500/12 border border-cyan-500/25 rounded-md px-2.5 py-1 text-[10px] font-semibold text-cyan-700 dark:text-cyan-400 text-center"
              >
                {child}
              </div>
            ))}
          </div>
        </div>
      );

    // Default: Unknown type
    default:
      return (
        <div
          className={`mt-3 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs text-slate-500 ${className}`}
        >
          Unknown infographic type: {infographic.type}
        </div>
      );
  }
}
