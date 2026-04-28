/**
 * Analytics Infographic Types
 * Author: Kiro AI
 * Created: 2025-01-XX
 * 
 * Purpose: Analytics-related infographic components (stats, kpi, performance, etc.)
 */
'use client';

import React from 'react';
import { ColorPalette } from '@/lib/infographic-themes';

interface AnalyticsTypeProps {
  data: any;
  colors: ColorPalette;
  ItemWrapper: React.ComponentType<{ children: React.ReactNode }>;
}

export const StatsType: React.FC<AnalyticsTypeProps> = ({ data, colors, ItemWrapper }) => (
  <div className="mt-3 grid grid-cols-2 gap-2">
    {data?.metrics?.map((metric: any, i: number) => (
      <ItemWrapper key={i}>
        <div
          className="p-2 rounded-lg border"
          style={{
            backgroundColor: colors.background,
            borderColor: colors.border,
          }}
        >
          <div className="text-[10px] opacity-70 mb-0.5" style={{ color: colors.text }}>
            {metric.label}
          </div>
          <div className="text-sm font-bold" style={{ color: colors.primary }}>
            {metric.value}
          </div>
          <div
            className="text-[10px] flex items-center gap-1"
            style={{
              color:
                metric.trend === 'up'
                  ? colors.success
                  : metric.trend === 'down'
                    ? colors.danger
                    : colors.text,
            }}
          >
            {metric.trend === 'up' && '↑'}
            {metric.trend === 'down' && '↓'}
            {metric.trend === 'neutral' && '→'}
            <span>{metric.change}</span>
          </div>
        </div>
      </ItemWrapper>
    ))}
  </div>
);

export const KpiType: React.FC<AnalyticsTypeProps> = ({ data, colors, ItemWrapper }) => (
  <div className="grid grid-cols-2 gap-1.5 mt-3">
    {data?.kpis?.map((kpi: any, i: number) => (
      <ItemWrapper key={i}>
        <div
          className="border rounded-lg p-2.5 text-center"
          style={{
            backgroundColor: colors.background,
            borderColor: colors.border,
          }}
        >
          <div
            className="text-xl font-extrabold"
            style={{
              color: kpi.color === 'indigo'
                ? colors.primary
                : kpi.color === 'green'
                  ? colors.success
                  : kpi.color === 'amber'
                    ? colors.warning
                    : colors.accent,
            }}
          >
            {kpi.value}
          </div>
          <div className="text-[10px] mt-0.5" style={{ color: colors.text }}>
            {kpi.label}
          </div>
        </div>
      </ItemWrapper>
    ))}
  </div>
);

export const PerformanceType: React.FC<AnalyticsTypeProps> = ({ data, colors, ItemWrapper }) => (
  <div className="mt-3 flex flex-col gap-1.5">
    {data?.performers?.map((perf: any, i: number) => (
      <ItemWrapper key={i}>
        <div className="flex items-center gap-2">
          <div className="text-xs w-16 flex-shrink-0" style={{ color: colors.text }}>
            {perf.name}
          </div>
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: colors.background }}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${perf.score}%`,
                backgroundColor: perf.score >= 90
                  ? colors.success
                  : perf.score >= 70
                    ? colors.accent
                    : colors.warning,
              }}
            />
          </div>
          <div
            className="text-xs font-bold"
            style={{
              color: perf.score >= 90
                ? colors.success
                : perf.score >= 70
                  ? colors.accent
                  : colors.warning,
            }}
          >
            {perf.score}
          </div>
        </div>
      </ItemWrapper>
    ))}
  </div>
);

export const PerformanceBarsType: React.FC<AnalyticsTypeProps> = ({ data, colors, ItemWrapper }) => (
  <div className="mt-3 flex flex-col gap-1.5">
    {data?.performers?.map((perf: any, i: number) => {
      // Use theme colors dynamically
      const colorIndex = i % 6;
      const themeColors = [colors.primary, colors.secondary, colors.accent, colors.success, colors.warning, colors.danger];
      const barColor = themeColors[colorIndex];

      return (
        <ItemWrapper key={i}>
          <div className="flex items-center gap-2">
            <div
              className="text-xs w-16 flex-shrink-0"
              style={{ color: colors.text }}
            >
              {perf.name}
            </div>
            <div
              className="flex-1 h-1.5 rounded-full overflow-hidden"
              style={{ backgroundColor: `${barColor}20` }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${perf.score}%`,
                  backgroundColor: barColor,
                }}
              />
            </div>
            <div className="text-xs font-bold" style={{ color: barColor }}>
              {perf.score}
            </div>
          </div>
        </ItemWrapper>
      );
    })}
  </div>
);

export const PredictionType: React.FC<AnalyticsTypeProps> = ({ data, colors, ItemWrapper }) => (
  <div className="mt-3 flex flex-col gap-1.5">
    {data?.predictions?.map((pred: any, i: number) => (
      <ItemWrapper key={i}>
        <div
          className="flex items-center gap-2 p-2 rounded-lg border"
          style={{
            backgroundColor: pred.status === 'ok'
              ? `${colors.success}06`
              : pred.status === 'warn'
                ? `${colors.warning}06`
                : `${colors.danger}06`,
            borderColor: pred.status === 'ok'
              ? `${colors.success}20`
              : pred.status === 'warn'
                ? `${colors.warning}20`
                : `${colors.danger}20`,
          }}
        >
          <span className="text-xs font-medium flex-1" style={{ color: colors.text }}>
            {pred.label}
          </span>
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: pred.status === 'ok'
                ? `${colors.success}15`
                : pred.status === 'warn'
                  ? `${colors.warning}15`
                  : `${colors.danger}15`,
              color: pred.status === 'ok'
                ? colors.success
                : pred.status === 'warn'
                  ? colors.warning
                  : colors.danger,
            }}
          >
            {pred.badge}
          </span>
        </div>
      </ItemWrapper>
    ))}
  </div>
);

export const TimelineType: React.FC<AnalyticsTypeProps> = ({ data, colors, ItemWrapper }) => (
  <div className="mt-3 flex flex-col gap-1.5">
    {data?.steps?.map((step: any, i: number) => (
      <ItemWrapper key={i}>
        <div className="flex items-start gap-2">
          <div
            className="w-2 h-2 rounded-full mt-1 flex-shrink-0"
            style={{
              backgroundColor:
                step.status === 'completed'
                  ? colors.primary
                  : step.status === 'active'
                    ? colors.accent
                    : colors.border,
              animation: step.status === 'active' ? 'pulse 2s infinite' : 'none',
            }}
          />
          <div className="flex-1">
            <div className="text-xs font-semibold" style={{ color: colors.text }}>
              {step.title}
            </div>
            {step.description && (
              <div className="text-[10px] opacity-70">
                {step.description}
              </div>
            )}
          </div>
          <span className="text-[10px] opacity-60">
            {step.time}
          </span>
        </div>
      </ItemWrapper>
    ))}
  </div>
);