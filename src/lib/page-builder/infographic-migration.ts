/**
 * Infographic Migration Utilities
 * Author: Kiro AI
 * Created: 2025-01-XX
 * 
 * Purpose: Migrate old infographic format to new format with theme/animation/style
 */

import { InfographicConfig, createDefaultInfographicConfig } from './infographic-defaults';
import { InfographicTheme, InfographicAnimation, InfographicStyle } from '@/lib/infographic-themes';

// Old format (legacy)
interface LegacyInfographic {
  type: string;
  data?: any;
}

// New format (with theme/animation/style)
interface ModernInfographic {
  type: string;
  data?: any;
  theme?: InfographicTheme;
  animation?: InfographicAnimation;
  style?: InfographicStyle;
}

/**
 * Migrate legacy infographic to modern format
 */
export function migrateInfographic(legacy: LegacyInfographic | ModernInfographic | undefined): ModernInfographic | undefined {
  if (!legacy) return undefined;

  // If already modern format, return as is
  if ('theme' in legacy || 'animation' in legacy || 'style' in legacy) {
    return legacy as ModernInfographic;
  }

  // Migrate legacy format
  return createDefaultInfographicConfig(legacy.type, legacy.data);
}

/**
 * Check if infographic is in legacy format
 */
export function isLegacyInfographic(infographic: any): infographic is LegacyInfographic {
  return infographic && 
         typeof infographic === 'object' && 
         'type' in infographic && 
         !('theme' in infographic) && 
         !('animation' in infographic) && 
         !('style' in infographic);
}

/**
 * Migrate entire section data
 */
export function migrateSectionInfographics(sectionData: any): any {
  if (!sectionData || typeof sectionData !== 'object') {
    return sectionData;
  }

  const migratedData = { ...sectionData };

  // Handle different section structures
  if (migratedData.cards && Array.isArray(migratedData.cards)) {
    migratedData.cards = migratedData.cards.map((card: any) => ({
      ...card,
      infographic: migrateInfographic(card.infographic),
    }));
  }

  if (migratedData.features && Array.isArray(migratedData.features)) {
    migratedData.features = migratedData.features.map((feature: any) => ({
      ...feature,
      infographic: migrateInfographic(feature.infographic),
    }));
  }

  if (migratedData.templates && Array.isArray(migratedData.templates)) {
    migratedData.templates = migratedData.templates.map((template: any) => ({
      ...template,
      infographic: migrateInfographic(template.infographic),
    }));
  }

  if (migratedData.events && Array.isArray(migratedData.events)) {
    migratedData.events = migratedData.events.map((event: any) => {
      const migratedEvent = { ...event };
      
      // Handle legacy infographicType and infographicData
      if (event.infographicType && !event.infographic) {
        migratedEvent.infographic = createDefaultInfographicConfig(
          event.infographicType,
          event.infographicData
        );
        // Keep legacy fields for backward compatibility
      }
      
      return migratedEvent;
    });
  }

  // Handle direct infographic property
  if (migratedData.infographic) {
    migratedData.infographic = migrateInfographic(migratedData.infographic);
  }

  return migratedData;
}

/**
 * Batch migrate multiple sections
 */
export function migrateSections(sections: any[]): any[] {
  return sections.map(section => ({
    ...section,
    data: migrateSectionInfographics(section.data),
  }));
}