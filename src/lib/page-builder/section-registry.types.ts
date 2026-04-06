import { SectionConfig } from './section-schemas';

export interface SectionTemplate {
  id: string;
  name: string;
  type: string;
  category: string;
  description: string;
  icon: string;
  defaultData: SectionConfig;
  configSchema: any;
}

export const SECTION_CATEGORIES = {
  HEADERS: 'Headers',
  CONTENT: 'Content',
  ACTIONS: 'Actions',
  SOCIAL: 'Social Proof',
  NAVIGATION: 'Navigation',
} as const;
