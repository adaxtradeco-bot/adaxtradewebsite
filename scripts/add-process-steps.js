/**
 * add-process-steps.js
 * Adds ProcessStepsSection to the sections registry in Vercel DB
 * Run: node scripts/add-process-steps.js [page-slug]
 * If no slug provided, lists all pages first
 */

const { PrismaClient } = require('@prisma/client');

// Use direct PostgreSQL URL (not Accelerate) so proxy works
process.env.DATABASE_URL = "postgres://a67872c36d94eaf8b0e1c1fb82d1effc1ab5f0a07674313b1f3d216150365c90:sk_B3x2Y8ZmrvcWSllCvS-yo@db.prisma.io:5432/postgres?sslmode=require";

const prisma = new PrismaClient();

const PROCESS_STEPS_SECTION = {
  id: `process-steps-${Date.now()}`,
  type: 'process-steps',
  order: 99,
  data: {
    eyebrow: 'How we work',
    sectionTitle: 'From first call',
    sectionTitleHighlight: 'full operation',
    description: "Most BPMS projects fail not because of the platform, but because of poor implementation. We bring specialized teams to every phase — so you're never alone navigating the journey from first process to full automation.",
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
        description: 'We immerse ourselves in your organization — mapping workflows, interviewing stakeholders, and uncovering the real bottlenecks. You get a clear project charter, risk plan, and delivery roadmap before any configuration begins.',
        tags: ['Stakeholder mapping', 'Process audit', 'Risk & scope definition', 'Delivery roadmap'],
      },
      {
        eyebrow: 'Design & Structure',
        badge: 'Process Architects + UX Team',
        title: 'Blueprint every workflow visually',
        description: 'Our specialists design every workflow, form, and user journey directly inside the BPMS visual designer — no technical background needed. Every screen is mapped and validated with your team before configuration begins.',
        tags: ['Visual workflow design', 'Form building', 'Org structure & roles', 'Role & permission planning', 'API connection mapping'],
      },
      {
        eyebrow: 'Configure & Connect',
        badge: 'Configuration + Integration Team',
        title: 'Your processes, configured and connected',
        description: 'Our team configures every form, business rule, dashboard, and KPI directly through the BPMS visual interface. We connect your existing systems using built-in connectors and a no-code API integration layer.',
        tags: ['Visual form builder', 'System integrations', 'KPI dashboards', 'No-code API connections'],
      },
      {
        eyebrow: 'Pilot & Go Live',
        badge: 'Launch & Training Team',
        title: 'Validate with real users, launch with confidence',
        description: 'We run a controlled pilot with real users, gather feedback, fine-tune processes, and train your team. A structured go-live plan and rollback readiness ensure a smooth, monitored launch with zero disruption.',
        tags: ['Controlled pilot', 'User training', 'Go-live planning', '24/7 monitoring'],
      },
      {
        eyebrow: 'Scale & Evolve',
        badge: 'Optimization & Support Team',
        title: 'Your platform grows with your ambition',
        description: "Post-launch is where real value compounds. We expand to new processes, deepen integrations, build executive-level analytics dashboards, and continuously refine flows based on live user feedback.",
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

async function main() {
  const targetSlug = process.argv[2];

  try {
    // List all pages
    const pages = await prisma.page.findMany({
      select: { id: true, title: true, slug: true, language: true, isBuilderPage: true },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`\n📄 Found ${pages.length} pages in DB:\n`);
    pages.forEach((p, i) => {
      console.log(`  ${i + 1}. [${p.language}] ${p.title}`);
      console.log(`     slug: ${p.slug}  |  builder: ${p.isBuilderPage}`);
    });

    if (!targetSlug) {
      console.log('\n⚠️  No slug provided.');
      console.log('Usage: node scripts/add-process-steps.js <slug>');
      console.log('Example: node scripts/add-process-steps.js bpms\n');
      return;
    }

    // Find target page
    const page = pages.find(p => p.slug === targetSlug);
    if (!page) {
      console.log(`\n❌ Page with slug "${targetSlug}" not found.`);
      return;
    }

    console.log(`\n🎯 Target: "${page.title}" (${page.slug})`);

    // Get full page data
    const fullPage = await prisma.page.findUnique({ where: { id: page.id } });
    if (!fullPage) return;

    const builderData = JSON.parse(fullPage.builderData || '{"sections":[]}');
    const sections = builderData.sections || [];

    // Check if already exists
    const exists = sections.find((s) => s.type === 'process-steps');
    if (exists) {
      console.log('⚠️  A process-steps section already exists on this page. Skipping.');
      return;
    }

    // Set order after last section
    const maxOrder = sections.reduce((max, s) => Math.max(max, s.order ?? 0), 0);
    PROCESS_STEPS_SECTION.order = maxOrder + 1;

    sections.push(PROCESS_STEPS_SECTION);
    builderData.sections = sections.sort((a, b) => a.order - b.order);

    await prisma.page.update({
      where: { id: page.id },
      data: {
        builderData: JSON.stringify(builderData),
        updatedAt: new Date(),
      },
    });

    console.log(`✅ ProcessSteps section added successfully!`);
    console.log(`📊 Page now has ${builderData.sections.length} sections.`);
    console.log(`🔢 Section order: ${PROCESS_STEPS_SECTION.order}`);

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
