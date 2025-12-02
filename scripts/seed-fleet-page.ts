import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Fleet Management page...');

  const page = await prisma.page.create({
    data: {
      slug: 'fleet-management',
      title: 'Fleet Management BPMS - Modern Fleet Operations',
      metaDescription: 'Enterprise-grade platform unifying Business Process Management with AVL telematics to digitize and optimize your entire fleet lifecycle.',
      language: 'en',
      status: 'published',
      isBuilderPage: true,
      builderData: JSON.stringify({ sections: [
        {
          id: 'hero-1',
          type: 'HeroSection',
          order: 0,
          props: {
            title: 'Fleet Management BPMS',
            subtitle: 'Enterprise-grade platform unifying Business Process Management with AVL telematics to digitize and optimize your entire fleet lifecycle.',
            primaryCTA: { text: 'Get Started', href: '/contact-sales' },
            secondaryCTA: { text: 'Learn More', href: '#features' },
            backgroundGradient: 'from-blue-900 via-blue-800 to-slate-900'
          }
        },
        {
          id: 'summary-1',
          type: 'ContentSection',
          order: 1,
          props: {
            title: 'Enterprise Fleet Management BPMS',
            content: 'This Fleet Management BPMS is an enterprise-grade platform meticulously engineered to unify BPMS with cutting-edge AVL telematics. It comprehensively digitizes the entire lifecycle of fleet operations, from initial vehicle demand and precise assignment to efficient dispatch, flawless route execution, and seamless customer communication.'
          }
        },
        {
          id: 'capabilities-1',
          type: 'FeaturesGridSection',
          order: 2,
          props: {
            title: 'Core Capabilities & Transformative Outcomes',
            subtitle: 'Comprehensive solutions that transform how you manage your fleet operations.',
            features: [
              {
                icon: '⏱️',
                title: 'Accelerated Workflows',
                description: 'Transform cumbersome processes into agile, transparent operations with real-time context and complete audit trails.'
              },
              {
                icon: '💰',
                title: 'Cost Reduction',
                description: 'Unlock significant savings through intelligent automation, optimized utilization, and predictive maintenance.'
              },
              {
                icon: '🛡️',
                title: 'Enhanced Safety',
                description: 'Exceed expectations with dynamic live maps, real-time alerts, and policy-driven rules for secure operations.'
              },
              {
                icon: '⚙️',
                title: 'Future-Proof Adaptability',
                description: 'Stay ahead with visual no-code builders and robust integration layer for seamless evolution.'
              }
            ]
          }
        },
        {
          id: 'features-1',
          type: 'FeaturesGridSection',
          order: 3,
          props: {
            title: 'Key System Features',
            subtitle: 'Powering every aspect of your fleet with comprehensive functionality.',
            features: [
              {
                icon: '🗺️',
                title: 'Intelligent Request & Assignment',
                description: 'End-to-end management from intake to trip closure with SLA tracking and auto-escalations.'
              },
              {
                icon: '🚦',
                title: 'Operational Execution',
                description: 'Manage trip lifecycle with geofenced checkpoints, incident handling, and live ETA updates.'
              },
              {
                icon: '📝',
                title: 'Time & Contract Management',
                description: 'Manage driver hours, shift rosters, overtime rules, and vehicle leasing contracts.'
              },
              {
                icon: '✅',
                title: 'Safety & Compliance',
                description: 'Driver behavior scoring, DVIR workflows, incident reporting, and compliance tools.'
              },
              {
                icon: '🛠️',
                title: 'Asset Management',
                description: 'Complete fleet registry, warranties, service plans, and preventive maintenance.'
              },
              {
                icon: '📊',
                title: 'Analytics & Reporting',
                description: 'Utilization reports, SLA metrics, safety scores, and TCO breakdowns.'
              }
            ]
          }
        },
        {
          id: 'workspaces-1',
          type: 'FeaturesGridSection',
          order: 4,
          props: {
            title: 'Role-Based Workspaces',
            subtitle: 'Optimized interfaces for every user in your fleet ecosystem.',
            features: [
              {
                title: 'Contact Center',
                description: 'Omni-channel intake, SLA monitoring, quick quotes, and alert management.'
              },
              {
                title: 'Dispatch & Operations',
                description: 'Auto-match suggestions, drag-and-drop scheduling, exception queues.'
              },
              {
                title: 'Drivers & Operators',
                description: 'Digital job cards, offline caching, navigation, DVIR forms.'
              },
              {
                title: 'Maintenance Teams',
                description: 'Fault inbox, PM backlog, safety incidents, compliance management.'
              }
            ]
          }
        },
        {
          id: 'integration-1',
          type: 'TwoColumnSection',
          order: 5,
          props: {
            title: 'Connected Ecosystem',
            subtitle: 'Our platform is built for a connected ecosystem. Seamlessly integrate with leading Telematics/AVL systems, ERP, HR, TMS, WMS, IAM/SSO, and essential map/traffic APIs.',
            items: [
              'Telematics/AVL Systems',
              'ERP Integration',
              'HR Platforms',
              'Map & Traffic APIs',
              'TMS/WMS Systems',
              'IAM/SSO Solutions'
            ],
            image: '🔗',
            imagePosition: 'right'
          }
        },
        {
          id: 'cta-1',
          type: 'CTASection',
          order: 6,
          props: {
            title: 'Ready to Transform Your Fleet Operations?',
            subtitle: 'Get started with our enterprise fleet management platform today.',
            primaryCTA: { text: 'Contact Sales', href: '/contact-sales' },
            secondaryCTA: { text: 'Request Demo', href: '/contact' },
            gradient: 'from-blue-600 to-indigo-700'
          }
        }
      ] })
    }
  });

  console.log('✅ Fleet Management page created:', page.slug);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
