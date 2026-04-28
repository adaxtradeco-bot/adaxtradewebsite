/**
 * Metro Grid Infographic Types
 * Author: Kiro AI
 * Created: 2025-01-XX
 * 
 * Purpose: Metro Grid-related infographic components (form, ai, analytics, portal, org)
 */
'use client';

import React from 'react';
import { ColorPalette } from '@/lib/infographic-themes';

interface MetroGridTypeProps {
  data: any;
  colors: ColorPalette;
  ItemWrapper: React.ComponentType<{ children: React.ReactNode }>;
}

export const FormType: React.FC<MetroGridTypeProps> = ({ data, colors, ItemWrapper }) => (
  <>
    {data?.title && (
      <div className="text-xs font-semibold mb-3" style={{ color: colors.text }}>
        {data.title}
      </div>
    )}
    <div className="flex flex-col gap-1.5 mt-3">
      {data?.fields?.map((field: any, i: number) => (
        <ItemWrapper key={i}>
          <div
            className="flex items-center gap-2 p-1.5 rounded-md border"
            style={{
              backgroundColor: `${colors.primary}08`,
              borderColor: `${colors.primary}15`,
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: colors.primary }} />
            <span className="text-[10px] font-medium" style={{ color: colors.text }}>
              {typeof field === 'string' ? field : field.label}
            </span>
            {field.type && (
              <span 
                className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full"
                style={{
                  color: colors.primary,
                  backgroundColor: `${colors.primary}10`,
                }}
              >
                {field.type}
              </span>
            )}
          </div>
        </ItemWrapper>
      ))}
    </div>
  </>
);

export const AiType: React.FC<MetroGridTypeProps> = ({ data, colors, ItemWrapper }) => (
  <>
    {data?.title && (
      <div className="text-xs font-semibold mb-3" style={{ color: colors.text }}>
        {data.title}
      </div>
    )}
    <div className="flex flex-col gap-1.5 mt-3">
      {data?.actions?.map((action: any, i: number) => (
        <ItemWrapper key={i}>
          <div
            className="flex items-center gap-2 p-1.5 rounded-md border"
            style={{
              backgroundColor: `${colors.secondary}08`,
              borderColor: `${colors.secondary}15`,
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: colors.secondary }} />
            <span className="text-[10px] font-medium" style={{ color: colors.text }}>
              {typeof action === 'string' ? action : action.action}
            </span>
            {action.status && (
              <span 
                className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full"
                style={{
                  color: colors.secondary,
                  backgroundColor: `${colors.secondary}10`,
                }}
              >
                {action.status}
              </span>
            )}
          </div>
        </ItemWrapper>
      ))}
    </div>
  </>
);

export const AnalyticsType: React.FC<MetroGridTypeProps> = ({ data, colors, ItemWrapper }) => (
  <>
    {data?.title && (
      <div className="text-xs font-semibold mb-3" style={{ color: colors.text }}>
        {data.title}
      </div>
    )}
    <div className="grid grid-cols-2 gap-1.5 mt-3">
      {data?.widgets?.map((widget: any, i: number) => (
        <ItemWrapper key={i}>
          <div 
            className="border rounded-md p-2 text-center"
            style={{
              backgroundColor: `${colors.success}08`,
              borderColor: `${colors.success}15`,
            }}
          >
            <div className="text-xs font-bold" style={{ color: colors.success }}>
              {typeof widget === 'string' ? widget : widget.name}
            </div>
            {widget.status && (
              <div className="text-[10px]" style={{ color: colors.text }}>
                {widget.status}
              </div>
            )}
          </div>
        </ItemWrapper>
      ))}
    </div>
  </>
);

export const PortalType: React.FC<MetroGridTypeProps> = ({ data, colors, ItemWrapper }) => (
  <>
    {data?.title && (
      <div className="text-xs font-semibold mb-3" style={{ color: colors.text }}>
        {data.title}
      </div>
    )}
    <div className="flex flex-col gap-1.5 mt-3">
      {data?.features?.map((feature: any, i: number) => (
        <ItemWrapper key={i}>
          <div
            className="flex items-center gap-2 p-1.5 rounded-md border"
            style={{
              backgroundColor: `${colors.warning}08`,
              borderColor: `${colors.warning}15`,
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: colors.warning }} />
            <span className="text-[10px] font-medium" style={{ color: colors.text }}>
              {typeof feature === 'string' ? feature : feature.feature}
            </span>
            {feature.level && (
              <span 
                className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full"
                style={{
                  color: colors.warning,
                  backgroundColor: `${colors.warning}10`,
                }}
              >
                {feature.level}
              </span>
            )}
          </div>
        </ItemWrapper>
      ))}
    </div>
  </>
);

export const OrgType: React.FC<MetroGridTypeProps> = ({ data, colors, ItemWrapper }) => (
  <div className="flex flex-col items-center gap-1.5 mt-3">
    <div 
      className="border rounded-md px-2.5 py-1 text-[10px] font-semibold"
      style={{
        backgroundColor: `${colors.primary}15`,
        borderColor: `${colors.primary}30`,
        color: colors.primary,
      }}
    >
      {data?.root}
    </div>
    <div className="w-px h-3" style={{ backgroundColor: colors.border }} />
    <div className="flex gap-1.5">
      {data?.children?.map((child: string, i: number) => (
        <ItemWrapper key={i}>
          <div
            className="border rounded-md px-2.5 py-1 text-[10px] font-semibold text-center"
            style={{
              backgroundColor: `${colors.accent}12`,
              borderColor: `${colors.accent}25`,
              color: colors.accent,
            }}
          >
            {child}
          </div>
        </ItemWrapper>
      ))}
    </div>
  </div>
);