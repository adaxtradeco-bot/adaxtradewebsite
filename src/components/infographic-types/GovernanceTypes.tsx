/**
 * Governance Infographic Types
 * Author: Kiro AI
 * Created: 2025-01-XX
 * 
 * Purpose: Governance-related infographic components (audit, roles, exception, etc.)
 */
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ColorPalette } from '@/lib/infographic-themes';

interface GovernanceTypeProps {
  data: any;
  colors: ColorPalette;
  ItemWrapper: React.ComponentType<{ children: React.ReactNode }>;
}

export const AuditType: React.FC<GovernanceTypeProps> = ({ data, colors, ItemWrapper }) => (
  <div className="mt-3 flex flex-col gap-1.5">
    {data?.trail?.map((item: any, i: number) => (
      <ItemWrapper key={i}>
        <div className="flex items-center gap-2 text-xs">
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{
              backgroundColor:
                item.type === 'success'
                  ? colors.primary
                  : item.type === 'ai'
                    ? colors.accent
                    : item.type === 'warning'
                      ? colors.secondary
                      : item.type === 'error'
                        ? '#ef4444'
                        : colors.primary,
            }}
          />
          <span className="flex-1" style={{ color: colors.text }}>
            {item.action}
          </span>
          <span className="text-[10px] opacity-60">{item.time}</span>
        </div>
      </ItemWrapper>
    ))}
  </div>
);

export const RolesType: React.FC<GovernanceTypeProps> = ({ data, colors, ItemWrapper }) => (
  <div className="mt-3 flex flex-col gap-1.5">
    {data?.roles?.map((role: any, i: number) => (
      <ItemWrapper key={i}>
        <div
          className="flex items-center gap-2 p-2 rounded-lg border"
          style={{
            backgroundColor: colors.background,
            borderColor: colors.border,
          }}
        >
          <span className="text-xs font-semibold" style={{ color: colors.primary }}>
            {role.name}
          </span>
          <span className="text-xs opacity-70">
            {role.access}
          </span>
        </div>
      </ItemWrapper>
    ))}
  </div>
);

export const ExceptionType: React.FC<GovernanceTypeProps> = ({ data, colors }) => (
  <div className="mt-3">
    <div 
      className="flex items-center gap-2 p-2 rounded-lg border"
      style={{
        backgroundColor: `${colors.danger}12`, // 12 = 7% opacity
        borderColor: `${colors.danger}33`, // 33 = 20% opacity
      }}
    >
      <span className="text-base">⚠</span>
      <div>
        <div className="text-xs font-semibold" style={{ color: colors.danger }}>
          {data?.title}
        </div>
        <div className="text-[10px]" style={{ color: colors.text }}>
          {data?.description}
        </div>
      </div>
      <span 
        className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full"
        style={{
          color: colors.warning,
          backgroundColor: `${colors.warning}20`,
        }}
      >
        {data?.badge}
      </span>
    </div>
  </div>
);

export const ExceptionAlertType: React.FC<GovernanceTypeProps> = ({ data, colors }) => (
  <div style={{ marginTop: '.75rem' }}>
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        background: `${colors.danger}12`,
        border: `1px solid ${colors.danger}33`,
        borderRadius: '8px',
      }}
    >
      <span style={{ fontSize: '16px' }}>⚠</span>
      <div>
        <div
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: data?.statusColor === 'red' ? colors.danger : colors.warning,
          }}
        >
          {data?.status}
        </div>
        <div style={{ fontSize: '10px', color: colors.text }}>
          {data?.detail}
        </div>
      </div>
      <span
        style={{
          marginLeft: 'auto',
          fontSize: '10px',
          fontWeight: 600,
          color:
            data?.badgeColor === 'amber'
              ? colors.warning
              : data?.badgeColor === 'green'
                ? colors.success
                : colors.accent,
          background:
            data?.badgeColor === 'amber'
              ? `${colors.warning}20`
              : data?.badgeColor === 'green'
                ? `${colors.success}20`
                : `${colors.accent}20`,
          padding: '2px 8px',
          borderRadius: '100px',
        }}
      >
        {data?.badge}
      </span>
    </div>
  </div>
);

export const RoleLevelsType: React.FC<GovernanceTypeProps> = ({ data, colors, ItemWrapper }) => (
  <div
    style={{
      marginTop: '.75rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '5px',
    }}
  >
    {data?.roles?.map((role: any, i: number) => {
      // Use theme colors dynamically
      const colorIndex = i % 6;
      const themeColors = [colors.primary, colors.secondary, colors.accent, colors.success, colors.warning, colors.danger];
      const roleColor = themeColors[colorIndex];

      return (
        <ItemWrapper key={i}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '7px 10px',
              background: `${roleColor}12`,
              border: `1px solid ${roleColor}25`,
              borderRadius: '6px',
            }}
          >
            <span
              style={{ fontSize: '11px', color: roleColor, fontWeight: 600 }}
            >
              {role.role}
            </span>
            <span style={{ fontSize: '11px', color: colors.text }}>
              {role.description}
            </span>
          </div>
        </ItemWrapper>
      );
    })}
  </div>
);