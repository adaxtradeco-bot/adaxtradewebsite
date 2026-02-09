/**
 * Migrate App Builder Dynamic Page API
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

const sections = [
  {
    id: 'hero-1',
    type: 'hero',
    order: 0,
    data: {
      title: 'Custom Apps. Zero Heavy Code.',
      subtitle: 'Build in days, not months',
      description: 'Design responsive internal tools with pages, workflows, reports, roles, and integrations.',
      buttons: [
        { text: 'Try the Builder', href: '#demo', variant: 'primary', size: 'lg' },
        { text: 'Browse Templates', href: '#features', variant: 'secondary', size: 'lg' }
      ],
      badges: [
        { text: 'No-Code', variant: 'success' },
        { text: 'AI-Assisted', variant: 'info' }
      ]
    },
    style: {
      backgroundColor: 'bg-gradient-to-br from-slate-50 via-white to-slate-100/50',
      textColor: 'text-slate-900',
      padding: 'py-20',
      alignment: 'center'
    }
  },
  {
    id: 'features-1',
    type: 'features',
    order: 1,
    data: {
      title: 'Everything You Need',
      subtitle: 'Core Capabilities',
      description: 'From simple forms to complex applications',
      items: [
        { title: 'Pages & Forms', description: 'Drag-and-drop builder', icon: '📝' },
        { title: 'Workflows', description: 'Visual designer', icon: '⚙️' },
        { title: 'Analytics', description: 'Real-time dashboards', icon: '📊' }
      ]
    },
    style: {
      backgroundColor: 'bg-white',
      textColor: 'text-slate-900',
      padding: 'py-16',
      alignment: 'center'
    }
  },
  {
    id: 'cta-1',
    type: 'cta',
    order: 2,
    data: {
      title: 'Ready to Build?',
      description: 'Start creating today',
      buttons: [
        { text: 'Get Started', href: '/signup', variant: 'primary', size: 'lg' }
      ]
    },
    style: {
      backgroundColor: 'bg-gradient-to-r from-violet-600 to-cyan-500',
      textColor: 'text-white',
      padding: 'py-20',
      alignment: 'center'
    }
  }
];

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existingPage = await prisma.page.findUnique({
      where: { slug: 'app-builder-dynamic' }
    });

    if (existingPage) {
      await prisma.page.update({
        where: { slug: 'app-builder-dynamic' },
        data: {
          builderData: JSON.stringify(sections),
          isBuilderPage: true,
          builderVersion: '1.0',
          updatedAt: new Date()
        }
      });

      return NextResponse.json({ 
        success: true, 
        message: 'Page migrated',
        pageId: existingPage.id
      });
    }

    const newPage = await prisma.page.create({
      data: {
        title: 'App Builder',
        slug: 'app-builder-dynamic',
        status: 'published',
        language: 'en',
        builderData: JSON.stringify(sections),
        isBuilderPage: true,
        builderVersion: '1.0'
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Page created',
      pageId: newPage.id
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ 
      error: 'Failed', 
      details: error instanceof Error ? error.message : 'Unknown'
    }, { status: 500 });
  }
}
