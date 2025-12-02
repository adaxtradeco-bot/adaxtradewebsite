import { Metadata } from 'next';
import { PageRenderer } from '@/components/admin/PageBuilder/PageRenderer';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const metadata: Metadata = {
  title: 'IVAFlow — The Intelligent Automation Platform',
  description: 'Orchestrate people, processes, and things with AI-native automation. No code required.',
};

export default async function HomePage() {
  const page = await prisma.page.findFirst({
    where: { slug: 'home', isBuilderPage: true },
  });

  if (!page?.builderData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">Welcome to IVAFlow</h1>
          <p className="text-xl text-slate-600">The Intelligent Automation Platform</p>
        </div>
      </div>
    );
  }

  const builderData = typeof page.builderData === 'string' 
    ? JSON.parse(page.builderData) 
    : page.builderData;

  return <PageRenderer sections={builderData.sections || []} />;
}
