/**
 * Workflow Builder Page - Database-driven dynamic page
 */

import { PageRenderer } from '@/components/admin/PageBuilder/PageRenderer';
import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

async function getPageData() {
  try {
    const page = await prisma.page.findFirst({
      where: {
        slug: '/en/workflow-builder',
        isBuilderPage: true
      }
    });
    
    if (!page || !page.builderData) return null;
    
    const builderData = JSON.parse(page.builderData);
    return builderData.sections || [];
  } catch (error) {
    console.error('Error fetching page data:', error);
    return null;
  }
}

export default async function WorkflowBuilderPage() {
  const sections = await getPageData();
  
  if (!sections) {
    notFound();
  }
  
  return (
    <PageRenderer 
      sections={sections} 
      isPreview={false}
    />
  );
}
