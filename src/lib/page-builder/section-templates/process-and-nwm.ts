/**
 * PROCESS_AND_NWM_TEMPLATES
 * Grouped by visual similarity and kept behavior-compatible with legacy registry order.
 */

import type { SectionTemplate } from '../section-registry.types';
import {
  WORKFLOW_SECTION,
  INTEGRATIONS_SECTION,
  PROCESS_SECTION,
} from '../section-registry-additions';
import { NWM_SECTION_TEMPLATES } from '../section-registry-nwm';

export const PROCESS_AND_NWM_TEMPLATES: SectionTemplate[] = [
  WORKFLOW_SECTION,

  INTEGRATIONS_SECTION,

  PROCESS_SECTION,

  ...NWM_SECTION_TEMPLATES,
];
