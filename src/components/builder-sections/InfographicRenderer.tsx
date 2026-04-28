/**
 * Infographic Renderer - Centralized Infographic System
 * Author: Amazon Q / Kiro AI
 * Created: 2024-01-20
 * Updated: 2025-01-XX - Refactored with modular infographic types
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

// Import modular infographic types
import {
  // Governance Types
  AuditType,
  RolesType,
  ExceptionType,
  ExceptionAlertType,
  RoleLevelsType,
  // Analytics Types
  StatsType,
  KpiType,
  PerformanceType,
  PerformanceBarsType,
  PredictionType,
  TimelineType,
  // Flow Types
  FlowType,
  FlowchartType,
  EventFlowType,
  // Workflow Types
  WorkflowType,
  SlaType,
  SlaBarsType,
  StatusListType,
  // Metro Grid Types
  FormType,
  AiType,
  AnalyticsType,
  PortalType,
  OrgType,
  // Media Type
  MediaType,
} from '@/components/infographic-types';

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

  // Render based on infographic type using modular components
  const renderInfographicType = () => {
    const commonProps = {
      data: infographic.data,
      colors,
      ItemWrapper,
    };

    switch (infographic.type) {
      // ==================== GOVERNANCE TYPES ====================
      case 'audit':
        return <AuditType {...commonProps} />;
      case 'roles':
        return <RolesType {...commonProps} />;
      case 'exception':
        return <ExceptionType {...commonProps} />;
      case 'exception-alert':
        return <ExceptionAlertType {...commonProps} />;
      case 'role-levels':
        return <RoleLevelsType {...commonProps} />;

      // ==================== ANALYTICS TYPES ====================
      case 'stats':
        return <StatsType {...commonProps} />;
      case 'kpi':
        return <KpiType {...commonProps} />;
      case 'performance':
        return <PerformanceType {...commonProps} />;
      case 'performance-bars':
        return <PerformanceBarsType {...commonProps} />;
      case 'prediction':
        return <PredictionType {...commonProps} />;
      case 'timeline':
        return <TimelineType {...commonProps} />;

      // ==================== FLOW TYPES ====================
      case 'flow':
        return <FlowType {...commonProps} />;
      case 'flowchart':
        return <FlowchartType {...commonProps} />;
      case 'event-flow':
        return <EventFlowType {...commonProps} />;

      // ==================== WORKFLOW TYPES ====================
      case 'workflow':
        return <WorkflowType {...commonProps} />;
      case 'sla':
        return <SlaType {...commonProps} />;
      case 'sla-bars':
        return <SlaBarsType {...commonProps} />;
      case 'status-list':
        return <StatusListType {...commonProps} />;

      // ==================== METRO GRID TYPES ====================
      case 'form':
        return <FormType {...commonProps} />;
      case 'ai':
        return <AiType {...commonProps} />;
      case 'analytics':
        return <AnalyticsType {...commonProps} />;
      case 'portal':
        return <PortalType {...commonProps} />;
      case 'org':
        return <OrgType {...commonProps} />;

      // ==================== MEDIA TYPE ====================
      case 'media':
        return <MediaType data={infographic.data} className={className} />;

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
  };

  return (
    <InfographicWrapper>
      {renderInfographicType()}
    </InfographicWrapper>
  );
}