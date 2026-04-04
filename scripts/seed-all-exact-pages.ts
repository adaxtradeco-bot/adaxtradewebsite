import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Deleting pages...');
  
  await prisma.page.deleteMany({
    where: {
      slug: {
        in: ['partnership', 'fleet-management', 'business-automation']
      }
    }
  });

  console.log('🌱 Creating pages with exact styling...');

  // Partnership
  await prisma.page.create({
    data: {
      slug: 'partnership',
      title: 'Partner Program - IVAFlow',
      metaDescription: 'Join the IVAFlow partner ecosystem and grow with AI-native no-code automation',
      language: 'en',
      status: 'published',
      isBuilderPage: true,
      builderData: JSON.stringify({ sections: [
        {
          id: 'hero-1',
          type: 'hero',
          order: 0,
          data: {
            title: 'Grow Your Business with IVAFlow',
            description: 'Join our partner ecosystem and deliver powerful automation solutions while unlocking predictable, recurring revenue.',
            buttons: [
              { text: 'Apply Now →', href: '#apply', variant: 'primary' },
              { text: 'Contact Partners Team', href: '/partners#contact', variant: 'secondary' }
            ]
          },
          style: {
            backgroundColor: 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900',
            textColor: 'text-white',
            padding: 'py-24 px-6',
            alignment: 'center',
            layout: 'full'
          }
        },
        {
          id: 'benefits-1',
          type: 'benefits-grid',
          order: 1,
          data: {
            badge: 'Partner Benefits',
            title: 'Why Partner with IVAFlow?',
            subtitle: 'Access exclusive benefits, enablement, and support to accelerate your growth.',
            features: [
              {
                icon: '💰',
                title: 'Revenue Growth',
                description: 'Unlock new revenue streams and expand your service offerings.',
                list: ['Competitive margins', 'Recurring revenue', 'Upsell & cross-sell', 'Deal registration']
              },
              {
                icon: '🎓',
                title: 'Training & Certification',
                description: 'Get your team certified and deliver world-class solutions.',
                list: ['Partner training', 'Tech certifications', 'Sales enablement', 'Live webinars']
              },
              {
                icon: '🤝',
                title: 'Dedicated Support',
                description: 'Work directly with our team for joint success.',
                list: ['Partner manager', 'Priority support', 'Pre-sales help', 'Co-marketing']
              },
              {
                icon: '🛠️',
                title: 'Partner Resources',
                description: 'Tools and templates to streamline delivery.',
                list: ['White-label options', 'Demo environments', 'Sales & marketing kits', 'Implementation packs']
              },
              {
                icon: '📈',
                title: 'Market Expansion',
                description: 'Reach new geographies & industries.',
                list: ['Co-marketing campaigns', 'Lead sharing', 'Directory listing', 'Success stories']
              },
              {
                icon: '🏆',
                title: 'Competitive Advantage',
                description: 'Stand out with an AI-native, IoT-capable platform.',
                list: ['Exclusive benefits', 'Early feature access', 'Roadmap input', 'Partner advisory board']
              }
            ]
          }
        },
        {
          id: 'types-1',
          type: 'partner-cards',
          order: 2,
          data: {
            badge: 'Partner Types',
            title: 'Choose Your Partnership Path',
            subtitle: 'Flexible models that match your business goals.',
            cards: [
              {
                icon: '🔧',
                title: 'Implementation Partner',
                description: 'Deploy and customize IVAFlow for clients. Ideal for IT consultancies & SIs.',
                features: ['Project-based revenue', 'Technical training', 'Best practices', 'Demo access', 'Pre-sales support'],
                cta: { text: 'Learn More →', href: '#apply' }
              },
              {
                icon: '💼',
                title: 'Reseller Partner',
                description: 'Sell IVAFlow directly; earn competitive margins. For VARs & solution providers.',
                features: ['Reseller discounts', 'Deal protection', 'Sales enablement', 'Co-selling', 'MDF funds'],
                cta: { text: 'Learn More →', href: '#apply' }
              },
              {
                icon: '🌐',
                title: 'Technology Partner',
                description: 'Integrate with IVAFlow and co-innovate. For software vendors & IoT providers.',
                features: ['API/integration support', 'Joint GTM', 'Co-innovation', 'Tech benefits', 'Marketplace listing'],
                cta: { text: 'Learn More →', href: '#apply' }
              }
            ]
          }
        },
        {
          id: 'requirements-1',
          type: 'TwoColumnSection',
          order: 3,
          data: {
            title: 'Ready to Get Started?',
            subtitle: 'Here is what we look for in potential partners:',
            items: [
              'Track record in automation/IT consulting',
              'Commitment to customer success',
              'Technical expertise or certification path',
              'Active sales/marketing capability',
              'Alignment with IVAFlow vision'
            ],
            image: '🤝',
            imagePosition: 'right'
          }
        },
        {
          id: 'cta-1',
          type: 'cta',
          order: 4,
          data: {
            title: 'Ready to Become a Partner?',
            description: 'Submit your application—our team will reach out within 48 hours to discuss next steps.',
            buttons: [
              { text: 'Apply Now →', href: '/partners/apply', variant: 'primary' },
              { text: 'Contact Partners Team', href: '/partners/contact', variant: 'secondary' }
            ]
          },
          style: {
            backgroundColor: 'bg-gradient-to-r from-blue-600 to-teal-500',
            textColor: 'text-white',
            padding: 'py-20 px-6',
            alignment: 'center'
          }
        }
      ] })
    }
  });

  console.log('✅ Partnership page created');

  // Fleet Management
  await prisma.page.create({
    data: {
      slug: 'fleet-management',
      title: 'Fleet Management BPMS',
      metaDescription: 'Enterprise-grade platform unifying Business Process Management with AVL telematics',
      language: 'en',
      status: 'published',
      isBuilderPage: true,
      builderData: JSON.stringify({ sections: [
        {
          id: 'hero-1',
          type: 'hero',
          order: 0,
          data: {
            title: 'Fleet Management BPMS',
            description: 'Enterprise-grade platform unifying Business Process Management with AVL telematics to digitize and optimize your entire fleet lifecycle.',
            buttons: [
              { text: 'Get Started', href: '/contact-sales', variant: 'primary' },
              { text: 'Learn More', href: '#features', variant: 'secondary' }
            ]
          },
          style: {
            backgroundColor: 'bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900',
            textColor: 'text-white',
            padding: 'py-24 px-6',
            alignment: 'center',
            layout: 'full'
          }
        },
        {
          id: 'summary-1',
          type: 'ContentSection',
          order: 1,
          data: {
            title: 'Enterprise Fleet Management BPMS',
            content: 'This Fleet Management BPMS is an enterprise-grade platform meticulously engineered to unify BPMS with cutting-edge AVL telematics. It comprehensively digitizes the entire lifecycle of fleet operations, from initial vehicle demand and precise assignment to efficient dispatch, flawless route execution, and seamless customer communication.'
          }
        },
        {
          id: 'capabilities-1',
          type: 'features-compact',
          order: 2,
          data: {
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
          type: 'features-minimal',
          order: 3,
          data: {
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
          type: 'features-minimal',
          order: 4,
          data: {
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
          data: {
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
          type: 'cta',
          order: 6,
          data: {
            title: 'Ready to Transform Your Fleet Operations?',
            description: 'Get started with our enterprise fleet management platform today.',
            buttons: [
              { text: 'Contact Sales', href: '/contact-sales', variant: 'primary' },
              { text: 'Request Demo', href: '/contact', variant: 'secondary' }
            ]
          },
          style: {
            backgroundColor: 'bg-gradient-to-r from-blue-600 to-indigo-700',
            textColor: 'text-white',
            padding: 'py-20 px-6',
            alignment: 'center'
          }
        }
      ] })
    }
  });

  console.log('✅ Fleet Management page created');

  // Business Automation
  await prisma.page.create({
    data: {
      slug: 'business-automation',
      title: 'Business Automation - From Idea to Impact',
      metaDescription: 'Unlock the power of no-code automation and transform your business workflows',
      language: 'en',
      status: 'published',
      isBuilderPage: true,
      builderData: JSON.stringify({ sections: [
        {
          id: 'hero-1',
          type: 'hero',
          order: 0,
          data: {
            title: 'Business Automation - From Idea to Impact',
            description: 'Unlock the power of no-code automation and transform your business workflows. Fast, flexible, and without writing a single line of code.',
            buttons: [
              { text: 'Get Started', href: '/contact-sales', variant: 'primary' },
              { text: 'Learn More', href: '#features', variant: 'secondary' }
            ]
          },
          style: {
            backgroundColor: 'bg-gradient-to-br from-indigo-900 via-purple-800 to-slate-900',
            textColor: 'text-white',
            padding: 'py-24 px-6',
            alignment: 'center',
            layout: 'full'
          }
        },
        {
          id: 'challenges-1',
          type: 'features-compact',
          order: 1,
          data: {
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
          type: 'cta',
          order: 2,
          data: {
            title: 'Why Automate?',
            description: 'Managing daily business operations means juggling endless approvals, emails, paperwork, and follow-ups. What if much of that could run automatically? Eliminate manual work, reduce errors, save hours, gain real-time insight, and scale faster.'
          },
          style: {
            backgroundColor: 'bg-gradient-to-r from-blue-600 to-indigo-700',
            textColor: 'text-white',
            padding: 'py-16 px-6',
            alignment: 'center'
          }
        },
        {
          id: 'features-1',
          type: 'features-minimal',
          order: 3,
          data: {
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
          type: 'features-compact',
          order: 4,
          data: {
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
          data: {
            title: 'Industry Adaptability',
            content: 'Our no-code automation platform drives impact across diverse sectors including Finance, Healthcare, Retail, Manufacturing, Government, and Construction.'
          }
        },
        {
          id: 'guarantee-1',
          type: 'cta',
          order: 6,
          data: {
            title: 'Our Commitment: Rapid Delivery, Real Results',
            description: 'We guarantee to bring your automation project from concept to live deployment in 8 weeks or less. Our no-code platform combined with expert guidance ensures your solution is delivered right — fast, efficient, and scalable.',
            buttons: [
              { text: 'Start Your Project', href: '/contact-sales', variant: 'primary' },
              { text: 'Learn More', href: '/contact', variant: 'secondary' }
            ]
          },
          style: {
            backgroundColor: 'bg-gradient-to-r from-indigo-600 to-purple-700',
            textColor: 'text-white',
            padding: 'py-20 px-6',
            alignment: 'center'
          }
        }
      ] })
    }
  });

  console.log('✅ Business Automation page created');
  console.log('🎉 All pages created successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
