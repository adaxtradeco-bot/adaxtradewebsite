import { notFound } from 'next/navigation';
import { PageRenderer } from '@/components/admin/PageBuilder/PageRenderer';
import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Partner Program - IVAFlow',
    description: 'Join the IVAFlow partner ecosystem and grow with AI-native no-code automation',
  };
}

async function getPageData() {
  try {
    const page = await prisma.page.findFirst({
      where: {
        slug: 'partnership-2',
        language: 'en',
      },
    });
    return page;
  } catch (error) {
    console.error('Error fetching page:', error);
    return null;
  }
}

export default async function Partnership2Page() {
  const pageData = await getPageData();
  
  if (!pageData) {
    notFound();
  }

  const builderData = JSON.parse(pageData.builderData || '{"sections":[]}');
  return <PageRenderer sections={builderData.sections || builderData} />;
}
