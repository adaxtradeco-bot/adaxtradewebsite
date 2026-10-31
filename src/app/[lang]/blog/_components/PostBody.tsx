'use client';

import { PageRenderer } from '@/components/admin/PageBuilder/PageRenderer';
import type { SectionConfig } from '@/lib/page-builder/section-schemas';

export function PostBody({ sections }: { sections: SectionConfig[] }) {
  return <PageRenderer sections={sections} />;
}
