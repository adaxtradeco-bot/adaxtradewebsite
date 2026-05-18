/**
 * Section Preview Types
 * Types for section preview functionality
 */

import { SectionConfig } from '@/lib/page-builder/section-schemas';

export type PreviewDevice = 'desktop' | 'tablet' | 'mobile';
export type PreviewTheme = 'light' | 'dark';

export interface SectionPreviewData {
  sectionType: string;
  sampleData: SectionConfig;
  description: string;
  features: string[];
}

export interface PreviewModalProps {
  isOpen: boolean;
  sectionType: string;
  sectionName: string;
  sectionDescription: string;
  sampleData: SectionConfig;
  onClose: () => void;
  onAddSection: () => void;
}
