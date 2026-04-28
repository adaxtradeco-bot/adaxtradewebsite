/**
 * Workflow Infographic Types
 * Author: Kiro AI
 * Created: 2025-01-XX
 * 
 * Purpose: Workflow-related infographic components (workflow, sla, status-list)
 */
'use client';

import React from 'react';
import { ColorPalette } from '@/lib/infographic-themes';

interface WorkflowTypeProps {
  data: any;
  colors: ColorPalette;
  ItemWrapper: React.ComponentType<{ children: React.ReactNode }>;
}

export const WorkflowType: React.FC<WorkflowTypeProps> = ({ data, colors, ItemWrapper }) => (
  <>
    <div className="text-xs font-semibold mb-3" style={{ color: colors.text }}>
      {data?.title}
    </div>
    <div className="flex flex-col gap-1.5">
      {data?.steps?.map((step: any, i: number) => (
        <ItemWrapper key={i}>
          <div
            className="flex items-center gap-2.5 p-2 rounded-lg border"
            style={{
              backgroundColor: `${colors.primary}08`,
              borderColor: `${colors.primary}15`,
            }}
          >
            <div 
              className="w-5.5 h-5.5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
              style={{ backgroundColor: colors.primary }}
            >
              {step.num}
            </div>
            <div className="text-xs font-medium flex-1" style={{ color: colors.text }}>
              {step.label}
            </div>
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: step.type === 'auto'
                  ? `${colors.success}15`
                  : step.type === 'ai'
                    ? `${colors.primary}15`
                    : step.type === 'conditional'
                      ? `${colors.warning}15`
                      : `${colors.accent}15`,
                color: step.type === 'auto'
                  ? colors.success
                  : step.type === 'ai'
                    ? colors.primary
                    : step.type === 'conditional'
                      ? colors.warning
                      : colors.accent,
              }}
            >
              {step.badge}
            </span>
          </div>
        </ItemWrapper>
      ))}
    </div>
  </>
);

export const SlaType: React.FC<WorkflowTypeProps> = ({ data, colors, ItemWrapper }) => (
  <>
    <div className="text-xs font-semibold mb-3" style={{ color: colors.text }}>
      {data?.title}
    </div>
    <div className="flex flex-col gap-2">
      {data?.bars?.map((bar: any, i: number) => (
        <ItemWrapper key={i}>
          <div className="flex items-center gap-2.5">
            <span className="text-xs w-20 flex-shrink-0" style={{ color: colors.text }}>
              {bar.label}
            </span>
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: colors.background }}>
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${bar.value}%`,
                  backgroundColor: bar.value >= 90
                    ? colors.success
                    : bar.value >= 70
                      ? colors.warning
                      : colors.danger,
                }}
              />
            </div>
            <span
              className="text-[10px] font-semibold w-8 text-right"
              style={{
                color: bar.value >= 90
                  ? colors.success
                  : bar.value >= 70
                    ? colors.warning
                    : colors.danger,
              }}
            >
              {bar.value}%
            </span>
          </div>
        </ItemWrapper>
      ))}
    </div>
  </>
);

export const SlaBarsType: React.FC<WorkflowTypeProps> = ({ data, colors, ItemWrapper }) => (
  <>
    <div className="text-xs font-semibold mb-3" style={{ color: colors.text }}>
      {data?.title}
    </div>
    <div className="sla-bars flex flex-col gap-2">
      {data?.bars?.map((bar: any, i: number) => {
        const barColor = bar.status === 'green'
          ? colors.success
          : bar.status === 'amber'
            ? colors.warning
            : colors.danger;

        return (
          <ItemWrapper key={i}>
            <div className="sla-row flex items-center gap-2">
              <span className="sla-label text-xs w-24 flex-shrink-0" style={{ color: colors.text }}>
                {bar.label}
              </span>
              <div className="sla-bar-wrap flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: colors.background }}>
                <div
                  className="sla-bar h-full rounded-full transition-all duration-1000"
                  style={{ width: `${bar.value}%`, backgroundColor: barColor }}
                />
              </div>
              <span
                className="sla-val text-xs font-semibold w-10 text-right"
                style={{ color: barColor }}
              >
                {bar.value}%
              </span>
            </div>
          </ItemWrapper>
        );
      })}
    </div>
  </>
);

export const StatusListType: React.FC<WorkflowTypeProps> = ({ data, colors, ItemWrapper }) => (
  <div className="mt-3 flex flex-col gap-1">
    {data?.items?.map((item: any, i: number) => {
      const statusColor = item.color === 'red'
        ? colors.danger
        : item.color === 'amber'
          ? colors.warning
          : colors.success;

      return (
        <ItemWrapper key={i}>
          <div
            className="flex items-center gap-2 p-1.5 rounded-md border"
            style={{
              backgroundColor: `${statusColor}07`,
              borderColor: `${statusColor}20`,
            }}
          >
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: statusColor }}
            />
            <span className="text-xs flex-1" style={{ color: colors.text }}>
              {item.label}
            </span>
            <span
              className="ml-auto text-[10px] font-semibold"
              style={{ color: statusColor }}
            >
              {item.status}
            </span>
          </div>
        </ItemWrapper>
      );
    })}
  </div>
);