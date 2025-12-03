import { notFound } from 'next/navigation';
import { PageRenderer } from '@/components/admin/PageBuilder/PageRenderer';
import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Fleet Management BPMS - Modern Fleet Operations',
    description: 'Enterprise-grade platform unifying Business Process Management with AVL telematics to digitize and optimize your entire fleet lifecycle.',
  };
}

async function getPageData() {
  try {
    const page = await prisma.page.findFirst({
      where: {
        slug: 'fleet-management',
        language: 'en',
      },
    });
    return page;
  } catch (error) {
    console.error('Error fetching page:', error);
    return null;
  }
}

export default async function FleetManagementPage() {
  const pageData = await getPageData();
  
  if (!pageData) {
    notFound();
  }

  const builderData = JSON.parse(pageData.builderData || '{"sections":[]}');
  return <PageRenderer sections={builderData.sections || builderData} />;
}