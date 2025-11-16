import { Metadata } from 'next';
import { PageRenderer } from '@/components/admin/PageBuilder/PageRenderer';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const metadata: Metadata = {
  title: 'Real Estate Solutions - IVAFlow',
  description: 'Streamline property management and operations',
};

export default async function RealEstatePage() {
  const page = await prisma.page.findFirst({
    where: { slug: 'industries-real-estate', isBuilderPage: true },
  });

  if (!page?.builderData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-slate-700 to-yellow-500">
        <div className="text-center text-white">
          <h1 className="text-5xl font-bold mb-4">Real Estate Solutions</h1>
          <p className="text-xl">Modern automation for property management</p>
        </div>
      </div>
    );
  }

  const builderData = typeof page.builderData === 'string' 
    ? JSON.parse(page.builderData) 
    : page.builderData;

  return <PageRenderer sections={builderData.sections || []} />;
}
