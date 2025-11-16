/**
 * Complete Oil & Gas Page Seed - Matching oilgas.html
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Oil & Gas page (complete version)...');

  await prisma.page.deleteMany({
    where: { slug: 'industries-oilgas' }
  });

  await prisma.page.create({
    data: {
      slug: 'industries-oilgas',
      title: 'Oil & Gas Solutions - IVAFlow',
      metaDescription: 'Remote-ready, Compliance-first Field Operations for Oil & Gas',
      status: 'published',
      isBuilderPage: true,
      builderData: JSON.stringify({
        sections: [
          // Hero Section
          {
            id: 'hero-1',
            type: 'industry-hero',
            order: 0,
            data: {
              badge: 'Oil & Gas',
              title: 'Remote-ready, Compliance-first Field Operations',
              subtitle: '',
              description: 'Standardize inspections, HSE, incidents, and asset PM in remote sites with offline apps and IoT telemetry',
              primaryButton: { text: 'Book Demo', href: '/contact' },
              secondaryButton: { text: 'Start Free', href: '/contact' },
              pills: ['Offline', 'HSE', 'IoT Telemetry', 'Compliance'],
              stats: []
            },
            style: { theme: 'oilgas', gradient: 'from-blue-900 to-amber-600' }
          },
          
          // Outcomes, Workflows, Highlights Cards
          {
            id: 'cards-1',
            type: 'feature-cards',
            order: 1,
            data: {
              cards: [
                {
                  icon: 'TrendingDown',
                  title: 'Outcomes',
                  details: [
                    '↓ downtime with PM + sensors',
                    '↓ incident impact via fast escalation',
                    '↑ audit readiness'
                  ]
                },
                {
                  icon: 'Workflow',
                  title: 'Common Workflows',
                  details: [
                    'Asset inspection & PM',
                    'Permit-to-work approvals',
                    'Incident/HSE reporting',
                    'Environmental checks'
                  ]
                },
                {
                  icon: 'Star',
                  title: 'Highlights',
                  details: [
                    'Mobile offline',
                    'SLA timers & alerts',
                    'Dashboards'
                  ]
                }
              ]
            },
            style: { columns: 3, showBullets: true }
          },

          // Playbook Section
          {
            id: 'features-1',
            type: 'industry-features',
            order: 2,
            data: {
              badge: 'How it works',
              title: 'Playbook',
              subtitle: '',
              description: 'Implementation steps',
              features: [
                { id: 'f1', icon: 'Package', title: 'Deploy standard packs', description: 'HSE, PM, PTW templates ready to use' },
                { id: 'f2', icon: 'Radio', title: 'Connect device gateways', description: 'IoT telemetry integration' },
                { id: 'f3', icon: 'AlertTriangle', title: 'Set escalations', description: 'Regulatory docs and alerts' },
                { id: 'f4', icon: 'BarChart', title: 'Track KPIs', description: 'Monitor across all sites' }
              ]
            },
            style: { imagePosition: 'right' }
          },

          // Integrations, Security, Deliverables Cards
          {
            id: 'cards-2',
            type: 'feature-cards',
            order: 3,
            data: {
              cards: [
                {
                  icon: 'Link',
                  title: 'Integrations',
                  details: [
                    'SSO • ERP/CMMS',
                    'MQTT/HTTP device ingest',
                    'Webhooks'
                  ]
                },
                {
                  icon: 'Shield',
                  title: 'Security & Governance',
                  details: [
                    'RBAC & audit',
                    'Encryption',
                    'Backups & DR'
                  ]
                },
                {
                  icon: 'Package',
                  title: 'Deliverables',
                  details: [
                    'HSE & PM packs',
                    'Compliance dashboards',
                    'Runbook'
                  ]
                }
              ]
            },
            style: { columns: 3, showBullets: true }
          },

          // CTA Section
          {
            id: 'cta-1',
            type: 'cta',
            order: 4,
            data: {
              title: 'See Oil & Gas in action',
              description: 'Field-proven workflows, from inspection to incident',
              primaryButton: { text: 'Book a Demo', href: '/contact' },
              secondaryButton: { text: 'Start Free', href: '/contact' }
            },
            style: { gradient: 'from-amber-500 to-blue-600' }
          }
        ]
      })
    }
  });

  console.log('✅ Oil & Gas page created successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
