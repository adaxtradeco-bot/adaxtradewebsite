import { Metadata } from 'next';
import { PageRenderer } from '@/components/admin/PageBuilder/PageRenderer';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const metadata: Metadata = {
  title: 'Oil & Gas Solutions - IVAFlow',
  description: 'Transform oil & gas operations with intelligent automation',
};

export const dynamic = 'force-dynamic';

export default async function OilGasPage() {
  const page = await prisma.page.findFirst({
    where: { slug: 'industries-oilgas', isBuilderPage: true },
  });

  if (!page?.builderData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-900 to-amber-500">
        <div className="text-center text-white">
          <h1 className="text-5xl font-bold mb-4">Oil & Gas Solutions</h1>
          <p className="text-xl">Intelligent automation for energy sector</p>
        </div>
      </div>
    );
  }

  const builderData = typeof page.builderData === 'string' 
    ? JSON.parse(page.builderData) 
    : page.builderData;

  return <PageRenderer sections={builderData.sections || []} />;
}
