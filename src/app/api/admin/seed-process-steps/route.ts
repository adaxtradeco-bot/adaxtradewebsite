/**
 * POST /api/admin/seed-process-steps
 * One-time seeder: adds ProcessStepsSection to a target page in Vercel DB.
 * Body: { slug: string }  — if omitted, returns list of all pages.
 * Protected by admin JWT.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

const PROCESS_STEPS_SECTION = {
  id: `process-steps-${Date.now()}`,
  type: 'process-steps',
  order: 99,
  data: {
    eyebrow: 'How we work',
    sectionTitle: 'From first call',
    sectionTitleHighlight: 'full operation',
    description:
      "Most BPMS projects fail not because of the platform, but because of poor implementation. We bring specialized teams to every phase — so you're never alone navigating the journey from first process to full automation.",
    stats: [
      { value: '5', label: 'Structured phases' },
      { value: '100%', label: 'Team-led delivery' },
      { value: '24/7', label: 'Post-launch support' },
    ],
    steps: [
      {
        eyebrow: 'Discovery',
        badge: 'Business Analysis Team',
        title: 'Understand before we build',
        description:
          'We immerse ourselves in your organization — mapping workflows, interviewing stakeholders, and uncovering the real bottlenecks. You get a clear project charter, risk plan, and delivery roadmap before any configuration begins.',
        tags: ['Stakeholder mapping', 'Process audit', 'Risk & scope definition', 'Delivery roadmap'],
      },
      {
        eyebrow: 'Design & Structure',
        badge: 'Process Architects + UX Team',
        title: 'Blueprint every workflow visually',
        description:
          'Our specialists design every workflow, form, and user journey directly inside the BPMS visual designer — no technical background needed. Every screen is mapped and validated with your team before configuration begins.',
        tags: ['Visual workflow design', 'Form building', 'Org structure & roles', 'Role & permission planning', 'API connection mapping'],
      },
      {
        eyebrow: 'Configure & Connect',
        badge: 'Configuration + Integration Team',
        title: 'Your processes, configured and connected',
        description:
          'Our team configures every form, business rule, dashboard, and KPI directly through the BPMS visual interface. We connect your existing systems using built-in connectors and a no-code API integration layer.',
        tags: ['Visual form builder', 'System integrations', 'KPI dashboards', 'No-code API connections'],
      },
      {
        eyebrow: 'Pilot & Go Live',
        badge: 'Launch & Training Team',
        title: 'Validate with real users, launch with confidence',
        description:
          'We run a controlled pilot with real users, gather feedback, fine-tune processes, and train your team. A structured go-live plan and rollback readiness ensure a smooth, monitored launch with zero disruption.',
        tags: ['Controlled pilot', 'User training', 'Go-live planning', '24/7 monitoring'],
      },
      {
        eyebrow: 'Scale & Evolve',
        badge: 'Optimization & Support Team',
        title: 'Your platform grows with your ambition',
        description:
          "Post-launch is where real value compounds. We expand to new processes, deepen integrations, build executive-level analytics dashboards, and continuously refine flows based on live user feedback.",
        tags: ['New process rollout', 'SLA management', 'Executive dashboards', 'Ongoing optimization'],
      },
    ],
    footerTitle: 'Ready to automate your business?',
    footerSubtitle: 'Start with a free discovery session — no commitment required.',
    footerButtonText: 'Book a free session',
    footerButtonHref: '#',
    accentColor: '#4F7FFF',
    accentColor2: '#7B5CFF',
  },
  style: {
    backgroundColor: 'bg-white dark:bg-[#07080A]',
    textColor: 'text-slate-900 dark:text-white',
    padding: 'py-24',
  },
};

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pages = await prisma.page.findMany({
      orderBy: { updatedAt: 'desc' },
      select: { id: true, title: true, slug: true, language: true, isBuilderPage: true },
    });

    return NextResponse.json({ pages });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await request.json();
    if (!slug) {
      return NextResponse.json({ error: 'slug is required' }, { status: 400 });
    }

    const page = await prisma.page.findFirst({ where: { slug } });
    if (!page) {
      return NextResponse.json({ error: `Page "${slug}" not found` }, { status: 404 });
    }

    const builderData = JSON.parse((page.builderData as string) || '{"sections":[]}');
    const sections: any[] = builderData.sections || [];

    if (sections.find((s: any) => s.type === 'process-steps')) {
      return NextResponse.json({ message: 'process-steps section already exists on this page', skipped: true });
    }

    const maxOrder = sections.reduce((max: number, s: any) => Math.max(max, s.order ?? 0), 0);
    const newSection = { ...PROCESS_STEPS_SECTION, id: `process-steps-${Date.now()}`, order: maxOrder + 1 };

    sections.push(newSection);
    builderData.sections = sections.sort((a: any, b: any) => a.order - b.order);

    await prisma.page.update({
      where: { id: page.id },
      data: { builderData: JSON.stringify(builderData), updatedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: `ProcessSteps section added to "${page.title}"`,
      totalSections: builderData.sections.length,
      sectionOrder: newSection.order,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
