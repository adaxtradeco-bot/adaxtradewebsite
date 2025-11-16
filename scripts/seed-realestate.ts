/**
 * Real Estate Page Seed
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Real Estate page...');

  await prisma.page.deleteMany({
    where: { slug: 'industries-real-estate' }
  });

  await prisma.page.create({
    data: {
      slug: 'industries-real-estate',
      title: 'Real Estate Solutions - IVAFlow',
      metaDescription: 'Streamline property management with digital workflows',
      status: 'published',
      isBuilderPage: true,
      builderData: JSON.stringify({
        sections: [
          // Hero
          {
            id: 'hero-1',
            type: 'industry-hero',
            order: 0,
            data: {
              title: 'Real Estate Workflow Automation',
              subtitle: 'Streamline Property Management',
              description: 'Streamline property management, tenant applications, maintenance requests, and lease agreements with digital workflows',
              primaryButton: { text: 'Get Started →', href: '/contact' },
              secondaryButton: { text: 'Watch Demo', href: '/contact' },
              stats: [
                { value: '50%', label: 'Faster Leasing' },
                { value: '70%', label: 'Less Paperwork' },
                { value: '24/7', label: 'Tenant Portal' }
              ]
            },
            style: { theme: 'realestate', gradient: 'from-emerald-900 to-emerald-700' }
          },

          // Stats
          {
            id: 'stats-1',
            type: 'stats',
            order: 1,
            data: {
              title: 'Trusted by Property Managers',
              stats: [
                { value: 10000, suffix: '+', label: 'Properties Managed', icon: '🏢', color: 'green' },
                { value: 95, suffix: '%', label: 'Tenant Satisfaction', icon: '⭐', color: 'cyan' },
                { value: 50, suffix: '%', label: 'Time Saved', icon: '⚡', color: 'violet' },
                { value: 80, suffix: '%', label: 'Fewer Calls', icon: '📞', color: 'orange' }
              ]
            },
            style: {}
          },

          // Challenges
          {
            id: 'challenges-1',
            type: 'feature-cards',
            order: 2,
            data: {
              title: 'Property Management Pain Points',
              subtitle: 'The challenges of managing properties, tenants, and maintenance',
              cards: [
                {
                  icon: 'ClipboardList',
                  title: 'Manual Application Process',
                  details: [
                    'Paper applications delay leasing',
                    'Manual screening is time-consuming',
                    'Slow approval frustrates applicants'
                  ]
                },
                {
                  icon: 'Wrench',
                  title: 'Maintenance Chaos',
                  details: [
                    'Scattered requests via calls/texts',
                    'Impossible to track priorities',
                    'No visibility into status'
                  ]
                },
                {
                  icon: 'FileText',
                  title: 'Document Management',
                  details: [
                    'Leases scattered across files',
                    'Inspection reports lost',
                    'Tenant documents disorganized'
                  ]
                },
                {
                  icon: 'MessageSquare',
                  title: 'Poor Communication',
                  details: [
                    'Tenants can\'t reach you easily',
                    'Leads to dissatisfaction',
                    'Increases turnover rates'
                  ]
                }
              ]
            },
            style: { columns: 2, showBullets: true }
          },

          // Solutions
          {
            id: 'solutions-1',
            type: 'feature-grid',
            order: 3,
            data: {
              title: 'Complete Property Management Platform',
              subtitle: 'Digital solutions for modern property management',
              features: [
                {
                  icon: 'FileEdit',
                  title: 'Online Applications',
                  description: 'Digital tenant applications with automated screening, background checks, and approval workflows'
                },
                {
                  icon: 'Wrench',
                  title: 'Maintenance Management',
                  description: 'Centralized maintenance request system with automatic routing, tracking, and tenant updates'
                },
                {
                  icon: 'FileCheck',
                  title: 'Lease Management',
                  description: 'Digital lease agreements with e-signatures, automatic renewals, and compliance tracking'
                },
                {
                  icon: 'Home',
                  title: 'Property Inspections',
                  description: 'Mobile inspection forms with photo capture, GPS location, and instant report generation'
                },
                {
                  icon: 'Users',
                  title: 'Tenant Portal',
                  description: 'Self-service portal for tenants to submit requests, pay rent, and communicate with management'
                },
                {
                  icon: 'BarChart3',
                  title: 'Reporting & Analytics',
                  description: 'Track occupancy, maintenance costs, and property performance with real-time dashboards'
                }
              ]
            },
            style: { columns: 3 }
          },

          // Case Study
          {
            id: 'case-study-1',
            type: 'case-study',
            order: 4,
            data: {
              title: 'Real Results from Property Managers',
              subtitle: 'Success stories from the field',
              caseStudies: [
                {
                  id: 'cs-1',
                  company: 'Multi-Family Portfolio',
                  industry: 'Property Management',
                  challenge: 'Manual processes causing delays in leasing, high volume of maintenance calls, and tenant dissatisfaction',
                  solution: 'Implemented IVAFlow digital platform with online applications, maintenance portal, and tenant self-service',
                  results: [
                    '50% faster leasing process',
                    '80% reduction in phone calls',
                    '95% tenant satisfaction score',
                    '70% less paperwork',
                    '24/7 tenant portal access'
                  ]
                }
              ]
            },
            style: {}
          },

          // Testimonial
          {
            id: 'testimonial-1',
            type: 'testimonial',
            order: 5,
            data: {
              title: 'What Property Managers Say',
              subtitle: 'Trusted by real estate professionals',
              testimonials: [
                {
                  quote: 'IVAFlow transformed our property management. Digital applications cut our leasing time in half, and the tenant portal reduced maintenance calls by 80%. Our tenants love the convenience.',
                  author: 'Sarah Johnson',
                  role: 'Property Manager',
                  company: 'Multi-Family Portfolio'
                },
                {
                  quote: 'The maintenance management system alone paid for itself in the first month. We can now track every request, assign vendors automatically, and keep tenants updated in real-time.',
                  author: 'Michael Chen',
                  role: 'Operations Director',
                  company: 'Urban Properties Group'
                },
                {
                  quote: 'Our tenant satisfaction scores went from 75% to 95% after implementing IVAFlow. The self-service portal is a game-changer for both us and our tenants.',
                  author: 'Emily Rodriguez',
                  role: 'Portfolio Manager',
                  company: 'Residential Management Co'
                }
              ]
            },
            style: {}
          },

          // Features Detail
          {
            id: 'features-detail-1',
            type: 'industry-features',
            order: 6,
            data: {
              title: 'Everything You Need',
              subtitle: 'Complete property management toolkit',
              description: 'All the tools you need to manage properties efficiently',
              features: [
                { id: 'f1', icon: 'FileEdit', title: 'Online Applications', description: 'Digital forms with automated screening' },
                { id: 'f2', icon: 'Wrench', title: 'Maintenance Portal', description: 'Centralized request management' },
                { id: 'f3', icon: 'FileSignature', title: 'E-Signatures', description: 'Digital lease agreements' },
                { id: 'f4', icon: 'Smartphone', title: 'Mobile Access', description: 'Manage on the go' }
              ],
              details: [
                'Automated tenant screening',
                'Background check integration',
                'Document management',
                'Payment processing',
                'Maintenance tracking',
                'Inspection checklists',
                'Lease renewals',
                'Compliance reporting'
              ]
            },
            style: { imagePosition: 'left' }
          },

          // FAQ
          {
            id: 'faq-1',
            type: 'faq',
            order: 7,
            data: {
              title: 'Frequently Asked Questions',
              subtitle: 'Everything you need to know',
              faqs: [
                { id: 'faq-1', question: 'How long does setup take?', answer: 'Most property managers are up and running within 1-2 weeks. We provide templates for applications, leases, and maintenance requests.' },
                { id: 'faq-2', question: 'Can tenants pay rent online?', answer: 'Yes! The tenant portal includes online rent payment with multiple payment methods including ACH, credit card, and debit card.' },
                { id: 'faq-3', question: 'Does it integrate with accounting software?', answer: 'Yes, we integrate with QuickBooks, Xero, and other popular accounting platforms for seamless financial management.' },
                { id: 'faq-4', question: 'Is there a mobile app?', answer: 'Yes, both property managers and tenants have access to mobile apps for iOS and Android.' }
              ]
            },
            style: { layout: 'single', defaultOpen: false, showNumbers: true }
          },

          // CTA
          {
            id: 'cta-1',
            type: 'cta',
            order: 8,
            data: {
              title: 'Ready to Modernize Your Property Management?',
              description: 'Join property managers streamlining operations with IVAFlow\'s digital platform',
              primaryButton: { text: 'Start Free Trial →', href: '/contact' },
              secondaryButton: { text: 'Schedule Demo', href: '/contact' }
            },
            style: { gradient: 'from-emerald-600 to-teal-600' }
          }
        ]
      })
    }
  });

  console.log('✅ Real Estate page created!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
