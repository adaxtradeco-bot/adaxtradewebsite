/**
 * Migrate App Builder Dynamic Page to Database
 * This script creates/updates the app-builder-dynamic page in the database
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const appBuilderSections = [
  {
    id: 'hero-app-builder',
    type: 'hero',
    order: 0,
    data: {
      title: 'Custom Apps. Zero Heavy Code.',
      subtitle: 'Build in days, not months',
      description: 'Design responsive internal tools with pages, workflows, reports, roles, and integrations. AI-assisted builder + enterprise controls = speed with confidence.',
      buttons: [
        {
          text: 'Try the Builder',
          href: '#demo',
          variant: 'primary',
          size: 'lg'
        },
        {
          text: 'Browse Templates',
          href: '#features',
          variant: 'secondary',
          size: 'lg'
        }
      ],
      badges: [
        { text: 'No-Code', variant: 'success' },
        { text: 'AI-Assisted', variant: 'info' },
        { text: 'SOC2/GDPR', variant: 'default' }
      ]
    }
  },
  {
    id: 'media-content-why',
    type: 'media-content',
    order: 1,
    data: {
      title: 'Why Choose App Builder?',
      subtitle: 'The Smart Way',
      description: 'Traditional development takes months and requires specialized teams. With IVAFlow App Builder, business users can create production-ready applications in days, not months.',
      mediaType: 'image',
      mediaUrl: '/placeholder-dashboard.jpg',
      mediaAlt: 'App Builder Dashboard',
      layout: 'media-right',
      features: [
        {
          icon: '⚡',
          title: 'Speed to Value',
          description: 'Launch in days instead of months with drag-and-drop interface'
        },
        {
          icon: '🎯',
          title: 'Business Fit',
          description: 'Customize every aspect to match your exact workflows'
        },
        {
          icon: '🔗',
          title: 'Unified Data',
          description: 'Connect all your systems in one centralized platform'
        }
      ],
      ctaText: 'See How It Works',
      ctaLink: '#demo',
      backgroundColor: 'bg-white dark:bg-neutral-900'
    }
  },
  {
    id: 'feature-cards-capabilities',
    type: 'features',
    order: 2,
    data: {
      title: 'Everything You Need to Build Apps',
      subtitle: 'Core Capabilities',
      description: 'From simple forms to complex multi-page applications with workflows, reports, and integrations',
      items: [
        {
          title: 'Pages & Forms',
          description: 'Drag-and-drop page builder with 50+ pre-built components, responsive design, and custom validation',
          icon: '📝'
        },
        {
          title: 'Workflows',
          description: 'Visual workflow designer with conditional logic, approval flows, and automated actions',
          icon: '⚙️'
        },
        {
          title: 'Reports & Analytics',
          description: 'Real-time dashboards with custom charts, data exports, and scheduled reports',
          icon: '📊'
        },
        {
          title: 'Roles & Permissions',
          description: 'Fine-grained access control with user groups, custom roles, and field-level security',
          icon: '👥'
        },
        {
          title: 'Integrations',
          description: 'Connect to 100+ apps with REST API, webhooks, and pre-built connectors',
          icon: '🔗'
        },
        {
          title: 'Enterprise Security',
          description: 'SOC 2, HIPAA, GDPR compliant with SSO/SAML, audit logs, and data encryption',
          icon: '🛡️'
        }
      ]
    }
  },
  {
    id: 'sidebar-content-builder',
    type: 'sidebar-content',
    order: 3,
    data: {
      sidebarItems: [
        {
          id: 'ui-blocks',
          label: 'UI Blocks',
          content: {
            title: 'Visual Drag-and-Drop Builder',
            description: 'Place forms, tables, charts, boards, and buttons; wire actions; set validations. Build pages without code.',
            features: [
              { text: 'Reusable components' },
              { text: 'Conditional UI' },
              { text: 'Inline validation' },
              { text: 'Form states' }
            ],
            placeholderIcon: '🎨',
            placeholderText: 'Canvas with component drawer + properties'
          }
        },
        {
          id: 'flows-rules',
          label: 'Flows & Rules',
          content: {
            title: 'Business Logic & Workflows',
            description: 'Create complex workflows with conditional logic, approvals, and automated actions without writing code.',
            features: [
              { text: 'Visual workflow designer' },
              { text: 'Conditional branching' },
              { text: 'Approval chains' },
              { text: 'Event triggers' }
            ],
            placeholderIcon: '⚡',
            placeholderText: 'Workflow canvas with nodes and connections'
          }
        },
        {
          id: 'themes',
          label: 'Themes',
          content: {
            title: 'Customizable Themes',
            description: 'Apply pre-built themes or create your own with custom colors, fonts, and styling options.',
            features: [
              { text: 'Pre-built templates' },
              { text: 'Custom color schemes' },
              { text: 'Typography control' },
              { text: 'Dark mode support' }
            ],
            placeholderIcon: '🎨',
            placeholderText: 'Theme customization panel'
          }
        },
        {
          id: 'custom-code',
          label: 'Custom Code',
          content: {
            title: 'Extend with Custom Code',
            description: 'Add JavaScript, CSS, or API integrations when you need advanced customization beyond no-code.',
            features: [
              { text: 'JavaScript functions' },
              { text: 'Custom CSS styles' },
              { text: 'API integrations' },
              { text: 'Code snippets library' }
            ],
            placeholderIcon: '💻',
            placeholderText: 'Code editor with syntax highlighting'
          }
        }
      ]
    },
    style: {
      backgroundColor: 'bg-slate-50 dark:bg-slate-800',
      textColor: 'text-slate-900 dark:text-white',
      padding: 'py-16',
      alignment: 'left'
    }
  },
  {
    id: 'testimonials-app-builder',
    type: 'testimonials',
    order: 4,
    data: {
      title: 'Trusted by Teams Worldwide',
      subtitle: 'Customer Stories',
      testimonials: [
        {
          name: 'Sarah Johnson',
          role: 'Operations Director, Logistics Co',
          content: 'We built our entire fleet management system in 2 weeks. Previously would have taken 6 months with traditional development.',
          rating: 5,
          avatar: '👩'
        },
        {
          name: 'Michael Chen',
          role: 'IT Manager, Finance Corp',
          content: 'The multi-workspace feature is a game-changer. We have separate apps for internal, partners, and customers all in one platform.',
          rating: 5,
          avatar: '👨'
        },
        {
          name: 'Emily Davis',
          role: 'Digital Lead, Healthcare Inc',
          content: 'HIPAA compliance out of the box saved us months of security audits. The platform just works.',
          rating: 5,
          avatar: '👩💼'
        }
      ]
    },
    style: {
      backgroundColor: 'bg-white dark:bg-neutral-900',
      textColor: 'text-slate-900 dark:text-white',
      padding: 'py-20',
      alignment: 'center'
    }
  },
  {
    id: 'cta-app-builder',
    type: 'cta',
    order: 5,
    data: {
      title: 'Ready to Build Your First App?',
      description: 'Start with a template or build from scratch. No credit card required.',
      buttons: [
        {
          text: 'Start Free Trial →',
          href: '/signup',
          variant: 'primary',
          size: 'lg'
        },
        {
          text: 'Talk to Sales',
          href: '/contact-sales',
          variant: 'secondary',
          size: 'lg'
        }
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

async function migrateAppBuilderPage() {
  try {
    console.log('🚀 Starting migration for app-builder-dynamic page...');

    // Check if page exists
    const existingPage = await prisma.page.findUnique({
      where: { slug: 'app-builder-dynamic' }
    });

    if (existingPage) {
      console.log('📝 Updating existing page...');
      await prisma.page.update({
        where: { slug: 'app-builder-dynamic' },
        data: {
          title: 'App Builder - IVAFlow',
          metaTitle: 'App Builder - Build Custom Apps Fast | IVAFlow',
          metaDescription: 'Build complete web apps in days with AI-assisted no-code platform',
          status: 'published',
          language: 'en',
          builderData: JSON.stringify(appBuilderSections),
          isBuilderPage: true,
          builderVersion: '1.0',
          updatedAt: new Date()
        }
      });
      console.log('✅ Page updated successfully!');
    } else {
      console.log('📝 Creating new page...');
      await prisma.page.create({
        data: {
          title: 'App Builder - IVAFlow',
          slug: 'app-builder-dynamic',
          metaTitle: 'App Builder - Build Custom Apps Fast | IVAFlow',
          metaDescription: 'Build complete web apps in days with AI-assisted no-code platform',
          status: 'published',
          language: 'en',
          builderData: JSON.stringify(appBuilderSections),
          isBuilderPage: true,
          builderVersion: '1.0'
        }
      });
      console.log('✅ Page created successfully!');
    }

    console.log('\n📊 Page Details:');
    console.log('   Slug: app-builder-dynamic');
    console.log(`   Sections: ${appBuilderSections.length}`);
    console.log('   Status: published');
    console.log('   Builder Version: 1.0');
    console.log('\n🎉 Migration completed successfully!');
    console.log('   You can now edit this page at: /admin/pages/builder/[page-id]');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateAppBuilderPage();
