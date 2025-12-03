import { notFound } from 'next/navigation';
import { PageRenderer } from '@/components/admin/PageBuilder/PageRenderer';
import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Business Automation - From Idea to Impact',
    description: 'Unlock the power of no-code automation and transform your business workflows. Fast, flexible, and without writing a single line of code.',
  };
}

async function getPageData() {
  try {
    const page = await prisma.page.findFirst({
      where: {
        slug: 'business-automation',
        language: 'en',
      },
    });
    return page;
  } catch (error) {
    console.error('Error fetching page:', error);
    return null;
  }
}

export default async function BusinessAutomationPage() {
  const pageData = await getPageData();
  
  if (!pageData) {
    notFound();
  }

  const builderData = JSON.parse(pageData.builderData || '{"sections":[]}');
  return <PageRenderer sections={builderData.sections || builderData} />;
}
