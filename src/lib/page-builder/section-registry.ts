/**
 * Page Builder Section Registry
 * Aggregates section templates from visual-similarity groups while preserving legacy order.
 */

import {
  SECTION_CATEGORIES,
  type SectionTemplate,
} from './section-registry.types';
import { FORM_BUILDER_SPECIAL_TEMPLATES } from './section-templates/form-builder-special';
import { AI_AGENT_PAGE_CORE_TEMPLATES } from './section-templates/ai-agent-page-core';
import { AI_AGENT_PAGE_EXTENDED_TEMPLATES } from './section-templates/ai-agent-page-extended';
import { HERO_LAYOUTS_CORE_TEMPLATES } from './section-templates/hero-layouts-core';
import { CARDS_INTERACTIVE_CORE_TEMPLATES } from './section-templates/cards-interactive-core';
import { PROCESS_AND_NWM_TEMPLATES } from './section-templates/process-and-nwm';
import { MEDIA_PROOF_CORE_TEMPLATES } from './section-templates/media-proof-core';
import { CARDS_AND_PARTNERS_TEMPLATES } from './section-templates/cards-and-partners';
import { HERO_TABS_FEATURE_WALLS_TEMPLATES } from './section-templates/hero-tabs-feature-walls';
import { PROCESS_AND_WHY_TEMPLATES } from './section-templates/process-and-why';
import { PLATFORM_SHOWCASE_TEMPLATES } from './section-templates/platform-showcase';
import { PLATFORM_CAPABILITIES_TEMPLATES } from './section-templates/platform-capabilities';
import { REPORTS_SHOWCASE_CORE_TEMPLATES } from './section-templates/reports-showcase-core';
import { REPORTS_SHOWCASE_ADVANCED_TEMPLATES } from './section-templates/reports-showcase-advanced';
import { EXTERNAL_PORTALS_TEMPLATES } from './section-templates/external-portals';
import { NAVIGATION_UI_TEMPLATES } from './section-templates/navigation-ui';

export { SECTION_CATEGORIES };
export type { SectionTemplate };

export const SECTION_TEMPLATES: SectionTemplate[] = [
  ...NAVIGATION_UI_TEMPLATES,
  ...FORM_BUILDER_SPECIAL_TEMPLATES,
  ...AI_AGENT_PAGE_CORE_TEMPLATES,
  ...AI_AGENT_PAGE_EXTENDED_TEMPLATES,
  ...EXTERNAL_PORTALS_TEMPLATES,
  ...HERO_LAYOUTS_CORE_TEMPLATES,
  ...CARDS_INTERACTIVE_CORE_TEMPLATES,
  ...PROCESS_AND_NWM_TEMPLATES,
  ...MEDIA_PROOF_CORE_TEMPLATES,
  ...CARDS_AND_PARTNERS_TEMPLATES,
  ...HERO_TABS_FEATURE_WALLS_TEMPLATES,
  ...PROCESS_AND_WHY_TEMPLATES,
  ...PLATFORM_SHOWCASE_TEMPLATES,
  ...PLATFORM_CAPABILITIES_TEMPLATES,
  ...REPORTS_SHOWCASE_CORE_TEMPLATES,
  ...REPORTS_SHOWCASE_ADVANCED_TEMPLATES,
];

export function getSectionTemplate(type: string): SectionTemplate | undefined {
  return SECTION_TEMPLATES.find((template) => template.type === type);
}

export function getSectionsByCategory(category: string): SectionTemplate[] {
  return SECTION_TEMPLATES.filter((template) => template.category === category);
}

export function getAllSectionTypes(): string[] {
  return Array.from(
    new Set(SECTION_TEMPLATES.map((template) => template.type))
  );
}
