/**
 * Main Industries Page Seed - Matching industry.html
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding main Industries page...');

  await prisma.page.deleteMany({
    where: { slug: 'industries' }
  });

  await prisma.page.create({
    data: {
      slug: 'industries',
      title: 'Industry Solutions - IVAFlow',
      metaDescription: 'Built for Your Industry - AI-native no-code automation',
      status: 'published',
      isBuilderPage: true,
      builderData: JSON.stringify({
        sections: [
          // Hero Section
          {
            id: 'hero-1',
            type: 'hero-animated',
            order: 0,
            data: {
              title: 'Built for Your Industry',
              subtitle: 'Transform Operations with AI-Native Automation',
              description: 'See how teams in fleet, construction, healthcare, government and more transform operations with AI-native no-code automation',
              primaryButton: { text: 'Explore Solutions', href: '#industry', variant: 'primary', size: 'lg' },
              secondaryButton: { text: 'Book Demo', href: '/contact', variant: 'outline', size: 'lg' },
              badges: []
            },
            style: { gradient: 'from-slate-900 via-slate-800 to-slate-900' }
          },

          // Industry Cards
          {
            id: 'industry-cards-1',
            type: 'industry-cards',
            order: 1,
            data: {
              eyebrow: 'Industry Solutions',
              title: 'Tailored for Complex Operations',
              subtitle: 'Ready-to-run building blocks you can tailor in minutes',
              cards: [
                {
                  icon: '🚚',
                  title: 'Fleet & Logistics',
                  description: 'Optimize your entire fleet with real-time tracking, automated dispatching, and route intelligence',
                  features: [
                    'Vehicle GPS + geofencing',
                    'Automated dispatch & routes',
                    'Driver check-in/out with proof',
                    'Fuel & maintenance tracking',
                    'Delivery proof (photo + GPS)',
                    'Performance dashboards'
                  ],
                  ctaText: 'View Fleet Solution →',
                  ctaLink: '/en/industries/fleet'
                },
                {
                  icon: '⚒',
                  title: 'Construction',
                  description: 'Run mobile-first site inspections, safety, and asset tracking—connected to approvals and reports',
                  features: [
                    'Site inspections (photo evidence)',
                    'Equipment logs & maintenance',
                    'Safety checklists & incidents',
                    'Attendance with geofencing',
                    'Progress documentation',
                    'Contractor management'
                  ],
                  ctaText: 'View Construction Solution →',
                  ctaLink: '/en/industries/construction'
                },
                {
                  icon: '🛢',
                  title: 'Oil & Gas',
                  description: 'Safeguard remote ops with offline forms, HSE compliance, and IoT monitoring',
                  features: [
                    'Asset inspections (offline)',
                    'HSE reporting & compliance',
                    'Incident management & escalation',
                    'Maintenance scheduling',
                    'IoT sensor integration',
                    'Regulatory documentation'
                  ],
                  ctaText: 'View Oil & Gas Solution →',
                  ctaLink: '/en/industries/oilgas'
                },
                {
                  icon: '🏥',
                  title: 'Healthcare',
                  description: 'Streamline patient journeys with intake forms, scheduling, and compliant documentation',
                  features: [
                    'Patient intake & registration',
                    'Scheduling automation',
                    'Equipment maintenance',
                    'Compliance workflows',
                    'Shift scheduling',
                    'HIPAA-aligned handling'
                  ],
                  ctaText: 'View Healthcare Solution →',
                  ctaLink: '/en/industries/healthcare'
                },
                {
                  icon: '🏛',
                  title: 'Government',
                  description: 'Digitize citizen services and internal approvals with secure, compliant automation',
                  features: [
                    'Service request management',
                    'Permit & license approvals',
                    'Inspection & compliance',
                    'Inter-department coordination',
                    'Public record management',
                    'RBAC, SSO, audit trails'
                  ],
                  ctaText: 'View Government Solution →',
                  ctaLink: '/en/industries/government'
                },
                {
                  icon: '🛍',
                  title: 'Retail',
                  description: 'Automate inventory, audits, and service ops—across all stores and regions',
                  features: [
                    'Inventory tracking & replenishment',
                    'Store audits & inspections',
                    'Customer service requests',
                    'Scheduling & attendance',
                    'Promo/campaign management',
                    'Multi-location dashboards'
                  ],
                  ctaText: 'View Retail Solution →',
                  ctaLink: '/en/industries/retail'
                },
                {
                  icon: '🏭',
                  title: 'Manufacturing',
                  description: 'Connect the shop floor with IoT telemetry, QC workflows, and maintenance requests',
                  features: [
                    'Production monitoring (IoT)',
                    'Quality checks & inspections',
                    'Maintenance requests',
                    'Supply-chain coordination',
                    'Safety incident reports',
                    'Real-time KPIs'
                  ],
                  ctaText: 'View Manufacturing Solution →',
                  ctaLink: '/en/industries/manufacturing'
                },
                {
                  icon: '🚀',
                  title: 'Startups',
                  description: 'Ship internal tools faster than hiring: CRM, HR, ops systems—without code',
                  features: [
                    'Custom CRM',
                    'HR onboarding & Mgmt',
                    'Inventory & assets',
                    'Support ticketing',
                    'Project workflows',
                    'Team collaboration'
                  ],
                  ctaText: 'View Startup Solution →',
                  ctaLink: '/en/industries/startups'
                }
              ]
            },
            style: { columns: 3 }
          },

          // CTA Section
          {
            id: 'cta-1',
            type: 'cta',
            order: 2,
            data: {
              title: 'Don\'t See Your Industry?',
              description: 'IVAFlow adapts to any process. Book a demo—we\'ll map your exact workflow in minutes',
              primaryButton: { text: 'Schedule Demo →', href: '/contact', variant: 'primary', size: 'lg' },
              secondaryButton: { text: 'Contact Sales', href: '/contact', variant: 'outline', size: 'lg' }
            },
            style: { gradient: 'from-blue-600 via-teal-600 to-cyan-600' }
          }
        ]
      })
    }
  });

  console.log('✅ Main Industries page created successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
