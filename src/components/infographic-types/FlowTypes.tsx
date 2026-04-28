/**
 * Flow Infographic Types
 * Author: Kiro AI
 * Created: 2025-01-XX
 * 
 * Purpose: Flow-related infographic components (flow, flowchart, event-flow)
 */
'use client';

import React from 'react';
import { ColorPalette } from '@/lib/infographic-themes';

interface FlowTypeProps {
  data: any;
  colors: ColorPalette;
  ItemWrapper: React.ComponentType<{ children: React.ReactNode }>;
}

export const FlowType: React.FC<FlowTypeProps> = ({ data, colors, ItemWrapper }) => {
  const getDynamicColor = (index: number, type: 'primary' | 'background' | 'border' = 'primary') => {
    const colorKeys = [colors.primary, colors.secondary, colors.accent, colors.success, colors.warning, colors.danger];
    const baseColor = colorKeys[index % 6];
    
    switch (type) {
      case 'background':
        return `${baseColor}12`; // 12 = ~7% opacity
      case 'border':
        return `${baseColor}33`; // 33 = ~20% opacity
      default:
        return baseColor;
    }
  };

  return (
    <div className="mt-3 flex flex-col gap-1">
      {data?.nodes?.map((node: any, i: number) => {
        const nodeColor = getDynamicColor(i);
        const bgColor = getDynamicColor(i, 'background');
        
        return (
          <ItemWrapper key={i}>
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                style={{
                  backgroundColor: bgColor,
                  color: nodeColor,
                }}
              >
                {i + 1}
              </div>
              <span className="text-xs" style={{ color: colors.text }}>
                {node.label}
              </span>
            </div>
          </ItemWrapper>
        );
      })}
    </div>
  );
};

export const FlowchartType: React.FC<FlowTypeProps> = ({ data, colors, ItemWrapper }) => (
  <div className="mt-3 flex flex-col gap-2">
    {data?.nodes?.map((node: any, i: number) => {
      const isLast = i === (data?.nodes?.length || 0) - 1;
      
      return (
        <ItemWrapper key={i}>
          <div className="flex flex-col items-center">
            {/* Node */}
            <div className="flex items-center justify-center relative">
              <div
                className={`px-3 py-2 rounded-lg text-xs font-medium border-2 min-w-[120px] text-center ${
                  node.type === 'decision' ? 'transform rotate-45' : ''
                }`}
                style={{
                  backgroundColor: node.type === 'start'
                    ? `${colors.success}10`
                    : node.type === 'end'
                      ? `${colors.danger}10`
                      : node.type === 'decision'
                        ? `${colors.warning}10`
                        : `${colors.primary}10`,
                  borderColor: node.type === 'start'
                    ? `${colors.success}30`
                    : node.type === 'end'
                      ? `${colors.danger}30`
                      : node.type === 'decision'
                        ? `${colors.warning}30`
                        : `${colors.primary}30`,
                  color: node.type === 'start'
                    ? colors.success
                    : node.type === 'end'
                      ? colors.danger
                      : node.type === 'decision'
                        ? colors.warning
                        : colors.primary,
                  ...(node.type === 'decision' && {
                    width: '80px',
                    height: '80px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  })
                }}
              >
                <span className={node.type === 'decision' ? 'transform -rotate-45' : ''}>
                  {node.label}
                </span>
              </div>
            </div>
            
            {/* Arrow */}
            {!isLast && (
              <div className="flex flex-col items-center py-1">
                <div className="w-px h-3" style={{ backgroundColor: colors.border }} />
                <div 
                  className="w-0 h-0 border-l-[4px] border-r-[4px] border-t-[6px] border-l-transparent border-r-transparent"
                  style={{ borderTopColor: colors.border }}
                />
              </div>
            )}
          </div>
        </ItemWrapper>
      );
    })}
  </div>
);

export const EventFlowType: React.FC<FlowTypeProps> = ({ data, colors }) => (
  <div className="flex flex-col gap-0 mt-1">
    {data?.steps?.map((step: any, idx: number) => (
      <div key={step.id || idx} className="flex items-stretch gap-0">
        {/* Left: dot + line */}
        <div className="flex flex-col items-center w-8 flex-shrink-0">
          <div
            className="w-2.5 h-2.5 rounded-full border-2 flex-shrink-0 mt-3.5 relative z-10"
            style={{
              borderColor: colors.primary,
              background: colors.background
            }}
          />
          {idx < (data?.steps?.length || 0) - 1 && (
            <div className="flex-1 w-px bg-white/10 mt-0.5 -mb-0.5" />
          )}
        </div>

        {/* Right: content */}
        <div className="flex-1 py-2.5 px-4 pb-4">
          <div
            className="font-mono text-[10px] uppercase tracking-[0.08em] mb-1"
            style={{ color: `${data?.color || colors.primary}B3` }}
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