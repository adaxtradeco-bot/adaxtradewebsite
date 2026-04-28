/**
 * Infographic Renderer - Centralized Infographic System
 * Author: Amazon Q / Kiro AI
 * Created: 2024-01-20
 * Updated: 2025-01-XX - Added advanced theme and animation system
 * 
 * Purpose: Universal infographic renderer for all section types
 * Supports: All infographic types + image/video fallback + themes + animations
 */
'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  InfographicTheme,
  InfographicAnimation,
  InfographicStyle,
  getThemeColors,
  getAnimationVariants,
  getStaggerContainerVariants,
  getHoverEffectClasses,
  getBackgroundEffectStyles,
  getBorderStyleProperties,
  applyThemeToInfographicData,
  getThemeCSSVariables,
  BORDER_RADIUS_MAP,
  DISPLAY_MODE_SCALES,
  DEFAULT_THEME,
  DEFAULT_ANIMATION,
  DEFAULT_STYLE,
} from '@/lib/infographic-themes';

export interface InfographicData {
  type: string;
  data?: any;
  
  // Theme configuration
  theme?: InfographicTheme;
  
  // Animation configuration
  animation?: InfographicAnimation;
  
  // Style configuration
  style?: InfographicStyle;
  
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
  infographic: infographicProp,
  className = '',
}: InfographicRendererProps) {
  // Migrate legacy infographic format
  const migratedInfographic = React.useMemo(() => {
    if (!infographicProp) return infographicProp;
    
    // If already has theme/animation/style, return as is
    if (infographicProp.theme || infographicProp.animation || infographicProp.style) {
      return infographicProp;
    }
    
    // Migrate legacy format by adding default theme/animation/style
    return {
      ...infographicProp,
      theme: DEFAULT_THEME,
      animation: DEFAULT_ANIMATION,
      style: DEFAULT_STYLE,
    };
  }, [infographicProp]);

  // Use migrated infographic for the rest of the component
  const processedInfographic = migratedInfographic;
  // Detect dark mode
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial theme
    const checkTheme = () => {
      const isDarkMode = document.documentElement.classList.contains('dark');
      setIsDark(isDarkMode);
    };

    checkTheme();

    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  // Get theme colors based on current mode
  const theme = processedInfographic.theme || DEFAULT_THEME;
  const animation = processedInfographic.animation || DEFAULT_ANIMATION;
  const style = processedInfographic.style || DEFAULT_STYLE;
  const colors = getThemeColors(theme, isDark);

  // Apply theme colors to infographic data
  const themedData = applyThemeToInfographicData(
    processedInfographic.data,
    colors,
    processedInfographic.type
  );

  // Update infographic data with themed colors
  const infographic = {
    ...processedInfographic,
    data: themedData,
  };

  // Helper function to get dynamic color based on index
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

  // Helper function to replace common hard-coded colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
      case 'green':
        return colors.success;
      case 'warning':
      case 'amber':
        return colors.warning;
      case 'error':
      case 'danger':
      case 'red':
        return colors.danger;
      case 'info':
      case 'cyan':
        return colors.accent;
      default:
        return colors.primary;
    }
  };

  // Get CSS variables for theme
  const cssVariables = getThemeCSSVariables(colors);

  // Get animation variants
  const variants = getAnimationVariants(animation);
  const containerVariants = getStaggerContainerVariants(animation);

  // Get style classes and properties
  const hoverClasses = getHoverEffectClasses(style.hoverEffect);
  const backgroundStyles = getBackgroundEffectStyles(
    style.backgroundEffect,
    style.backgroundPattern,
    colors,
    style
  );
  const borderStyles = getBorderStyleProperties(style.borderStyle, colors);
  const borderRadius = BORDER_RADIUS_MAP[style.borderRadius];
  const scale = DISPLAY_MODE_SCALES[style.displayMode];

  // Wrapper component with theme and animation
  const InfographicWrapper = ({ children }: { children: React.ReactNode }) => {
    const wrapperStyle: React.CSSProperties = {
      ...backgroundStyles,
      ...borderStyles,
      ...cssVariables,
      borderRadius,
      transform: `scale(${scale})`,
      transformOrigin: 'top left',
      color: colors.text,
      padding: '12px',
    };

    if (animation.type === 'stagger') {
      return (
        <motion.div
          className={`infographic-wrapper ${hoverClasses} ${className}`}
          style={wrapperStyle}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {children}
        </motion.div>
      );
    }

    return (
      <motion.div
        className={`infographic-wrapper ${hoverClasses} ${className}`}
        style={wrapperStyle}
        variants={variants}
        initial="hidden"
        animate="visible"
      >
        {children}
      </motion.div>
    );
  };

  // Item wrapper for stagger animation
  const ItemWrapper = ({ children }: { children: React.ReactNode }) => {
    if (animation.type === 'stagger') {
      return (
        <motion.div variants={variants}>
          {children}
        </motion.div>
      );
    }
    return <>{children}</>;
  };
  // If media override exists, render image/video instead
  if (infographic.mediaOverride) {
    if (infographic.mediaOverride.type === 'image') {
      return (
        <InfographicWrapper>
          <div className="mt-3">
            <img
              src={infographic.mediaOverride?.src || ''}
              alt={infographic.mediaOverride?.alt || 'Infographic'}
              className="w-full h-auto rounded-lg"
            />
          </div>
        </InfographicWrapper>
      );
    }
    if (infographic.mediaOverride?.type === 'video') {
      return (
        <InfographicWrapper>
          <div className="mt-3">
            <video
              src={infographic.mediaOverride?.src || ''}
              controls
              className="w-full h-auto rounded-lg"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </InfographicWrapper>
      );
    }
  }

  // Render based on infographic type
  switch (infographic.type) {
    // ==================== GOVERNANCE TYPES ====================
    case 'audit':
      return (
        <InfographicWrapper>
          <div className="mt-3 flex flex-col gap-1.5">
            {infographic.data?.trail?.map((item: any, i: number) => (
              <ItemWrapper key={i}>
                <div className="flex items-center gap-2 text-xs">
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0`}
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
        </InfographicWrapper>
      );

    case 'roles':
      return (
        <InfographicWrapper>
          <div className="mt-3 flex flex-col gap-1.5">
            {infographic.data?.roles?.map((role: any, i: number) => (
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
        </InfographicWrapper>
      );

    case 'exception':
      return (
        <div className={`mt-3 ${className}`}>
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
                {infographic.data?.title}
              </div>
              <div className="text-[10px]" style={{ color: colors.text }}>
                {infographic.data?.description}
              </div>
            </div>
            <span 
              className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{
                color: colors.warning,
                backgroundColor: `${colors.warning}20`,
              }}
            >
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
                  color: infographic.data?.statusColor === 'red' ? colors.danger : colors.warning,
                }}
              >
                {infographic.data?.status}
              </div>
              <div style={{ fontSize: '10px', color: colors.text }}>
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
                    ? colors.warning
                    : infographic.data?.badgeColor === 'green'
                      ? colors.success
                      : colors.accent,
                background:
                  infographic.data?.badgeColor === 'amber'
                    ? `${colors.warning}20`
                    : infographic.data?.badgeColor === 'green'
                      ? `${colors.success}20`
                      : `${colors.accent}20`,
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
            // Use theme colors dynamically
            const colorIndex = i % 6;
            const themeColors = [colors.primary, colors.secondary, colors.accent, colors.success, colors.warning, colors.danger];
            const roleColor = themeColors[colorIndex];

            return (
              <div
                key={i}
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
            );
          })}
        </div>
      );

    case 'stats':
      return (
        <InfographicWrapper>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {infographic.data?.metrics?.map((metric: any, i: number) => (
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
        </InfographicWrapper>
      );

    case 'flow':
      return (
        <div className={`mt-3 flex flex-col gap-1 ${className}`}>
          {infographic.data?.nodes?.map((node: any, i: number) => {
            const nodeColor = getDynamicColor(i);
            const bgColor = getDynamicColor(i, 'background');
            
            return (
              <div key={i} className="flex items-center gap-2">
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
            );
          })}
        </div>
      );

    case 'flowchart':
      return (
        <InfographicWrapper>
          <div className="mt-3 flex flex-col gap-2">
            {infographic.data?.nodes?.map((node: any, i: number) => {
              const isLast = i === (infographic.data?.nodes?.length || 0) - 1;
              
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
        </InfographicWrapper>
      );

    case 'timeline':
      return (
        <InfographicWrapper>
          <div className="mt-3 flex flex-col gap-1.5">
            {infographic.data?.steps?.map((step: any, i: number) => (
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
        </InfographicWrapper>
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
                    borderColor: colors.primary,
                    background: colors.background
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
        <InfographicWrapper>
          <div className="grid grid-cols-2 gap-1.5 mt-3">
            {infographic.data?.kpis?.map((kpi: any, i: number) => (
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
        </InfographicWrapper>
      );

    case 'performance':
      return (
        <InfographicWrapper>
          <div className="mt-3 flex flex-col gap-1.5">
            {infographic.data?.performers?.map((perf: any, i: number) => (
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
        </InfographicWrapper>
      );

    case 'performance-bars':
      return (
        <InfographicWrapper>
          <div className="mt-3 flex flex-col gap-1.5">
            {infographic.data?.performers?.map((perf: any, i: number) => {
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
        </InfographicWrapper>
      );

    case 'prediction':
      return (
        <InfographicWrapper>
          <div className="mt-3 flex flex-col gap-1.5">
            {infographic.data?.predictions?.map((pred: any, i: number) => (
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
        </InfographicWrapper>
      );

    case 'status-list':
      return (
        <InfographicWrapper>
          <div className="mt-3 flex flex-col gap-1">
            {infographic.data?.items?.map((item: any, i: number) => {
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
        </InfographicWrapper>
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
        <InfographicWrapper>
          <div className="text-xs font-semibold mb-3" style={{ color: colors.text }}>
            {infographic.data?.title}
          </div>
          <div className="flex flex-col gap-1.5">
            {infographic.data?.steps?.map((step: any, i: number) => (
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
        </InfographicWrapper>
      );

    case 'sla':
      return (
        <InfographicWrapper>
          <div className="text-xs font-semibold mb-3" style={{ color: colors.text }}>
            {infographic.data?.title}
          </div>
          <div className="flex flex-col gap-2">
            {infographic.data?.bars?.map((bar: any, i: number) => (
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
        </InfographicWrapper>
      );

    case 'sla-bars':
      return (
        <InfographicWrapper>
          <div className="text-xs font-semibold mb-3" style={{ color: colors.text }}>
            {infographic.data?.title}
          </div>
          <div className="sla-bars flex flex-col gap-2">
            {infographic.data?.bars?.map((bar: any, i: number) => {
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
        </InfographicWrapper>
      );

    // ==================== METRO GRID TYPES ====================
    case 'form':
      return (
        <InfographicWrapper>
          {infographic.data?.title && (
            <div className="text-xs font-semibold mb-3" style={{ color: colors.text }}>
              {infographic.data.title}
            </div>
          )}
          <div className="flex flex-col gap-1.5 mt-3">
            {infographic.data?.fields?.map((field: any, i: number) => (
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
        </InfographicWrapper>
      );

    case 'ai':
      return (
        <InfographicWrapper>
          {infographic.data?.title && (
            <div className="text-xs font-semibold mb-3" style={{ color: colors.text }}>
              {infographic.data.title}
            </div>
          )}
          <div className="flex flex-col gap-1.5 mt-3">
            {infographic.data?.actions?.map((action: any, i: number) => (
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
        </InfographicWrapper>
      );

    case 'analytics':
      return (
        <InfographicWrapper>
          {infographic.data?.title && (
            <div className="text-xs font-semibold mb-3" style={{ color: colors.text }}>
              {infographic.data.title}
            </div>
          )}
          <div className="grid grid-cols-2 gap-1.5 mt-3">
            {infographic.data?.widgets?.map((widget: any, i: number) => (
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
        </InfographicWrapper>
      );

    case 'portal':
      return (
        <InfographicWrapper>
          {infographic.data?.title && (
            <div className="text-xs font-semibold mb-3" style={{ color: colors.text }}>
              {infographic.data.title}
            </div>
          )}
          <div className="flex flex-col gap-1.5 mt-3">
            {infographic.data?.features?.map((feature: any, i: number) => (
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
        </InfographicWrapper>
      );

    case 'org':
      return (
        <InfographicWrapper>
          <div className="flex flex-col items-center gap-1.5 mt-3">
            <div 
              className="border rounded-md px-2.5 py-1 text-[10px] font-semibold"
              style={{
                backgroundColor: `${colors.primary}15`,
                borderColor: `${colors.primary}30`,
                color: colors.primary,
              }}
            >
              {infographic.data?.root}
            </div>
            <div className="w-px h-3" style={{ backgroundColor: colors.border }} />
            <div className="flex gap-1.5">
              {infographic.data?.children?.map((child: string, i: number) => (
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
        </InfographicWrapper>
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
