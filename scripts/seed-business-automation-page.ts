import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Business Automation page...');

  const page = await prisma.page.create({
    data: {
      slug: 'business-automation',
      title: 'Business Automation - From Idea to Impact',
      metaDescription: 'Unlock the power of no-code automation and transform your business workflows. Fast, flexible, and without writing a single line of code.',
      language: 'en',
      status: 'published',
      isBuilderPage: true,
      builderData: JSON.stringify({ sections: [
        {
          id: 'hero-1',
          type: 'HeroSection',
          order: 0,
          props: {
            title: 'Business Automation - From Idea to Impact',
            subtitle: 'Unlock the power of no-code automation and transform your business workflows. Fast, flexible, and without writing a single line of code.',
            primaryCTA: { text: 'Get Started', href: '/contact-sales' },
            secondaryCTA: { text: 'Learn More', href: '#features' },
            backgroundGradient: 'from-indigo-900 via-purple-800 to-slate-900'
          }
        },
        {
          id: 'challenges-1',
          type: 'FeaturesGridSection',
          order: 1,
          props: {
            title: 'The Modern Business Challenge',
            subtitle: 'We help organizations overcome inefficiencies, disconnected systems, and outdated tools — delivering results with speed and clarity.',
            features: [
              {
                icon: '🔄',
                title: 'Manual Processes',
                description: 'Replace repetitive, error-prone tasks with automated, reliable workflows that free your team to innovate.'
              },
              {
                icon: '🔗',
                title: 'Disconnected Systems',
                description: 'Break down data silos by unifying your tools and information into one consistent, accurate source.'
              },
              {
                icon: '⚙️',
                title: 'Outdated Tools',
                description: 'Upgrade without disruption—modern, adaptable systems designed to grow with your business.'
              },
              {
                icon: '📉',
                title: 'Limited Capacity',
                description: 'Implement meaningful process improvements quickly without straining your internal resources.'
              }
            ]
          }
        },
        {
          id: 'why-automate-1',
          type: 'CTASection',
          order: 2,
          props: {
            title: 'Why Automate?',
            subtitle: 'Managing daily business operations means juggling endless approvals, emails, paperwork, and follow-ups. What if much of that could run automatically?',
            gradient: 'from-blue-600 to-indigo-700'
          }
        },
        {
          id: 'features-1',
          type: 'FeaturesGridSection',
          order: 3,
          props: {
            title: 'How Our No-Code Platform Empowers You',
            subtitle: 'Comprehensive automation capabilities designed for business users.',
            features: [
              {
                title: 'Visual Workflow Builder',
                description: 'Drag-and-drop process design with web-based simplicity.'
              },
              {
                title: 'Flexible Stage & Role Management',
                description: 'Define unlimited process steps and assign roles dynamically.'
              },
              {
                title: 'Dynamic Conditions & Approvals',
                description: 'Automate decisions based on data, timing, and roles.'
              },
              {
                title: 'Custom Forms & Data Capture',
                description: 'Tailor data entry to each step or transition.'
              },
              {
                title: 'Automated Notifications',
                description: 'Send real-time SMS, email, and system alerts.'
              },
              {
                title: 'Live Workflow Monitoring',
                description: 'Track progress visually with real-time dashboards.'
              },
              {
                title: 'Manual & Event-Driven Triggers',
                description: 'Start processes on-demand or via event triggers.'
              },
              {
                title: 'Robust API Integration',
                description: 'Connect seamlessly with your existing systems and data sources.'
              }
            ]
          }
        },
        {
          id: 'consulting-1',
          type: 'FeaturesGridSection',
          order: 4,
          props: {
            title: 'Our Consulting: Strategy to Execution',
            subtitle: 'Expert guidance from concept to deployment and beyond.',
            features: [
              {
                title: 'Strategy Development',
                description: 'Senior consultants craft tailored automation roadmaps aligned with your business vision.'
              },
              {
                title: 'Analysis & Benefit Design',
                description: 'Identify challenges and design workflows that deliver measurable value.'
              },
              {
                title: 'Implementation Management',
                description: 'End-to-end delivery including configuration, integration, testing, and training.'
              },
              {
                title: 'Change & Risk Management',
                description: 'Support adoption and manage transformation risks for smooth rollout.'
              }
            ]
          }
        },
        {
          id: 'industries-1',
          type: 'ContentSection',
          order: 5,
          props: {
            title: 'Industry Adaptability',
            content: 'Our no-code automation platform drives impact across diverse sectors including Finance, Healthcare, Retail, Manufacturing, Government, and Construction.'
          }
        },
        {
          id: 'guarantee-1',
          type: 'CTASection',
          order: 6,
          props: {
            title: 'Our Commitment: Rapid Delivery, Real Results',
            subtitle: 'We guarantee to bring your automation project from concept to live deployment in 8 weeks or less. Our no-code platform combined with expert guidance ensures your solution is delivered right — fast, efficient, and scalable.',
            primaryCTA: { text: 'Start Your Project', href: '/contact-sales' },
            secondaryCTA: { text: 'Learn More', href: '/contact' },
            gradient: 'from-indigo-600 to-purple-700'
          }
        }
      ] })
    }
  });

  console.log('✅ Business Automation page created:', page.slug);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
