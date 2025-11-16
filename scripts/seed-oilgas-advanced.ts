/**
 * Advanced Oil & Gas Page - Premium Design
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Oil & Gas page (advanced version)...');

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
          // Animated Hero
          {
            id: 'hero-1',
            type: 'hero-animated',
            order: 0,
            data: {
              badge: 'Oil & Gas Industry',
              title: 'Remote-ready, Compliance-first Field Operations',
              subtitle: 'Transform Your Energy Operations',
              description: 'Standardize inspections, HSE, incidents, and asset PM in remote sites with offline apps and IoT telemetry',
              primaryButton: { text: 'Book Demo', href: '/contact', variant: 'primary', size: 'lg' },
              secondaryButton: { text: 'Start Free Trial', href: '/contact', variant: 'outline', size: 'lg' },
              badges: [
                { text: 'Offline Ready', variant: 'primary' },
                { text: 'HSE Compliant', variant: 'success' },
                { text: 'IoT Telemetry', variant: 'info' },
                { text: '99.9% Uptime', variant: 'warning' }
              ],
              backgroundImage: '/assets/oilgas-hero.jpg'
            },
            style: { gradient: 'from-blue-900 via-slate-900 to-amber-900' }
          },

          // Stats Section
          {
            id: 'stats-1',
            type: 'stats',
            order: 1,
            data: {
              title: 'Trusted by Leading Energy Companies',
              subtitle: 'Proven results across the industry',
              stats: [
                { value: 200, suffix: '+', label: 'Oil & Gas Companies', icon: '🏭', color: 'violet' },
                { value: 40, suffix: '%', label: 'Cost Reduction', icon: '💰', color: 'green' },
                { value: 99.9, suffix: '%', label: 'Safety Compliance', icon: '✅', color: 'cyan' },
                { value: 5000, suffix: '+', label: 'Wells Monitored', icon: '⚡', color: 'orange' }
              ],
              animationDuration: 2500
            },
            style: {}
          },

          // 3 Cards Section - Outcomes, Workflows, Highlights
          {
            id: 'cards-1',
            type: 'feature-cards',
            order: 2,
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

          // Feature Grid - Detailed Solutions
          {
            id: 'features-1',
            type: 'feature-grid',
            order: 3,
            data: {
              title: 'Comprehensive Solutions for Energy Sector',
              subtitle: 'Everything you need to optimize field operations',
              features: [
                {
                  icon: 'TrendingDown',
                  title: 'Reduce Downtime',
                  description: 'Predictive maintenance with PM schedules and IoT sensors to minimize equipment failures'
                },
                {
                  icon: 'Shield',
                  title: 'HSE Management',
                  description: 'Real-time incident reporting and fast escalation to reduce safety impact'
                },
                {
                  icon: 'FileCheck',
                  title: 'Audit Readiness',
                  description: 'Automated compliance documentation and regulatory reporting'
                },
                {
                  icon: 'Wrench',
                  title: 'Asset Inspection',
                  description: 'Standardized inspection workflows and preventive maintenance tracking'
                },
                {
                  icon: 'ClipboardCheck',
                  title: 'Permit-to-Work',
                  description: 'Digital approval workflows with SLA timers and automated notifications'
                },
                {
                  icon: 'AlertTriangle',
                  title: 'Incident Reporting',
                  description: 'Mobile-first HSE reporting with offline capability and photo documentation'
                }
              ]
            },
            style: { columns: 3 }
          },

          // Industry Features with Image
          {
            id: 'industry-features-1',
            type: 'industry-features',
            order: 4,
            data: {
              badge: 'How It Works',
              title: 'Implementation Playbook',
              subtitle: 'Get started in weeks, not months',
              description: 'Our proven methodology ensures rapid deployment with minimal disruption',
              image: '/assets/oilgas-dashboard.jpg',
              features: [
                {
                  id: 'f1',
                  icon: 'Package',
                  title: 'Deploy Standard Packs',
                  description: 'Pre-configured HSE, PM, and PTW templates ready for immediate use'
                },
                {
                  id: 'f2',
                  icon: 'Radio',
                  title: 'Connect IoT Gateways',
                  description: 'Integrate device telemetry via MQTT/HTTP for real-time monitoring'
                },
                {
                  id: 'f3',
                  icon: 'Bell',
                  title: 'Configure Escalations',
                  description: 'Set up SLA timers, alerts, and regulatory documentation workflows'
                },
                {
                  id: 'f4',
                  icon: 'BarChart3',
                  title: 'Track KPIs',
                  description: 'Monitor performance across all sites with customizable dashboards'
                }
              ],
              details: [
                'Mobile offline capability',
                'Real-time synchronization',
                'Role-based access control',
                'Audit trail logging',
                'Multi-site management',
                'Custom reporting engine'
              ]
            },
            style: { imagePosition: 'right' }
          },

          // Feature Grid - Technical Capabilities
          {
            id: 'features-2',
            type: 'feature-grid',
            order: 5,
            data: {
              title: 'Enterprise-Grade Platform',
              subtitle: 'Built for mission-critical operations',
              features: [
                {
                  icon: 'Link',
                  title: 'System Integrations',
                  description: 'SSO, ERP/CMMS connectivity, MQTT/HTTP device ingest, and webhooks'
                },
                {
                  icon: 'Lock',
                  title: 'Security & Governance',
                  description: 'RBAC, audit logs, end-to-end encryption, and disaster recovery'
                },
                {
                  icon: 'Smartphone',
                  title: 'Mobile Offline',
                  description: 'Full functionality without connectivity, automatic sync when online'
                },
                {
                  icon: 'Database',
                  title: 'Data Management',
                  description: 'Centralized data lake, real-time analytics, and compliance reporting'
                },
                {
                  icon: 'Zap',
                  title: 'Performance',
                  description: '99.99% uptime SLA, sub-second response times, global CDN'
                },
                {
                  icon: 'Headphones',
                  title: '24/7 Support',
                  description: 'Dedicated support team with industry expertise and rapid response'
                }
              ]
            },
            style: { columns: 3 }
          },

          // Case Study
          {
            id: 'case-study-1',
            type: 'case-study',
            order: 6,
            data: {
              title: 'Success Stories',
              subtitle: 'Real results from industry leaders',
              caseStudies: [
                {
                  id: 'cs-1',
                  company: 'Global Energy Corp',
                  logo: '/assets/logos/energy-corp.png',
                  industry: 'Oil & Gas Production',
                  challenge: 'Manual processes causing production delays, safety risks, and compliance issues across 50+ remote sites',
                  solution: 'Deployed IVAFlow platform with offline mobile apps, IoT integration, and automated workflows for HSE, PM, and PTW',
                  results: [
                    '40% reduction in operational costs',
                    '99.9% safety compliance achieved',
                    'Zero downtime incidents in 12 months',
                    '60% faster incident response time',
                    '24/7 real-time visibility across all sites'
                  ],
                  image: '/assets/case-studies/energy-corp.jpg'
                },
                {
                  id: 'cs-2',
                  company: 'PetroTech International',
                  logo: '/assets/logos/petrotech.png',
                  industry: 'Upstream Operations',
                  challenge: 'Disconnected systems, paper-based processes, and lack of real-time data visibility',
                  solution: 'Integrated platform with SCADA connectivity, mobile field apps, and predictive maintenance',
                  results: [
                    '50% reduction in equipment downtime',
                    '35% improvement in maintenance efficiency',
                    'ROI achieved in 6 months',
                    'Paperless operations across 30 sites',
                    'Real-time KPI dashboards for executives'
                  ],
                  image: '/assets/case-studies/petrotech.jpg'
                }
              ]
            },
            style: { layout: 'grid' }
          },

          // Testimonials
          {
            id: 'testimonials-1',
            type: 'testimonial',
            order: 7,
            data: {
              title: 'What Energy Leaders Say',
              subtitle: 'Trusted by operations teams worldwide',
              testimonials: [
                {
                  quote: 'IVAFlow transformed our field operations. The offline capability was a game-changer for our remote sites, and the HSE compliance features saved us during our last audit.',
                  author: 'James Wilson',
                  role: 'VP Operations, Global Energy Corp',
                  avatar: '/assets/avatars/james.jpg',
                  company: 'Global Energy Corp'
                },
                {
                  quote: 'We achieved ROI in just 6 months. The predictive maintenance features alone saved us millions in equipment downtime. Highly recommended for any energy company.',
                  author: 'Sarah Martinez',
                  role: 'Director of Operations, PetroTech',
                  avatar: '/assets/avatars/sarah.jpg',
                  company: 'PetroTech International'
                },
                {
                  quote: 'The platform is intuitive and powerful. Our field teams adopted it immediately, and the real-time dashboards give us visibility we never had before.',
                  author: 'David Chen',
                  role: 'CTO, Energy Solutions',
                  avatar: '/assets/avatars/david.jpg',
                  company: 'Energy Solutions Ltd'
                }
              ]
            },
            style: {}
          },

          // Timeline
          {
            id: 'timeline-1',
            type: 'timeline',
            order: 8,
            data: {
              title: 'Implementation Timeline',
              subtitle: 'From kickoff to full deployment in 8 weeks',
              items: [
                {
                  year: 'Week 1-2',
                  title: 'Discovery & Planning',
                  description: 'Assess current systems, define requirements, map workflows, and create implementation roadmap',
                  icon: '🔍'
                },
                {
                  year: 'Week 3-4',
                  title: 'Platform Configuration',
                  description: 'Deploy standard packs, configure workflows, integrate systems, and set up user roles',
                  icon: '⚙️'
                },
                {
                  year: 'Week 5-6',
                  title: 'Training & Testing',
                  description: 'Train field teams, conduct pilot deployment, validate workflows, and gather feedback',
                  icon: '🎯'
                },
                {
                  year: 'Week 7-8',
                  title: 'Full Rollout',
                  description: 'Deploy to all sites, monitor performance, optimize configurations, and provide ongoing support',
                  icon: '🚀'
                }
              ],
              layout: 'left',
              lineColor: 'bg-gradient-to-b from-amber-500 to-blue-600'
            },
            style: {}
          },

          // Pricing
          {
            id: 'pricing-1',
            type: 'pricing',
            order: 9,
            data: {
              title: 'Flexible Pricing Plans',
              subtitle: 'Choose the plan that fits your operations',
              plans: [
                {
                  name: 'Starter',
                  price: 499,
                  period: 'month',
                  description: 'Perfect for small operations',
                  features: [
                    'Up to 50 users',
                    'Basic HSE & PM workflows',
                    'Mobile offline apps',
                    'Email support',
                    '10 GB storage'
                  ],
                  highlighted: false,
                  buttonText: 'Start Free Trial',
                  buttonLink: '/contact'
                },
                {
                  name: 'Professional',
                  price: 1499,
                  period: 'month',
                  description: 'For growing energy companies',
                  features: [
                    'Up to 200 users',
                    'Advanced workflows & IoT',
                    'Custom integrations',
                    'Priority support',
                    '100 GB storage',
                    'Custom dashboards'
                  ],
                  highlighted: true,
                  buttonText: 'Book Demo',
                  buttonLink: '/contact'
                },
                {
                  name: 'Enterprise',
                  price: 'Custom',
                  period: '',
                  description: 'For large-scale operations',
                  features: [
                    'Unlimited users',
                    'Full platform access',
                    'Dedicated support team',
                    'Custom development',
                    'Unlimited storage',
                    'SLA guarantees',
                    'On-premise option'
                  ],
                  highlighted: false,
                  buttonText: 'Contact Sales',
                  buttonLink: '/contact'
                }
              ]
            },
            style: {}
          },

          // FAQ
          {
            id: 'faq-1',
            type: 'faq',
            order: 10,
            data: {
              title: 'Frequently Asked Questions',
              subtitle: 'Everything you need to know about our Oil & Gas solutions',
              faqs: [
                {
                  id: 'faq-1',
                  question: 'How long does implementation take?',
                  answer: 'Typically 6-8 weeks from kickoff to full deployment. We provide pre-configured templates for HSE, PM, and PTW workflows to accelerate the process.'
                },
                {
                  id: 'faq-2',
                  question: 'Does it work offline in remote locations?',
                  answer: 'Yes! Our mobile apps work fully offline and automatically sync data when connectivity is restored. This is essential for remote oil & gas operations.'
                },
                {
                  id: 'faq-3',
                  question: 'Can it integrate with our existing SCADA and ERP systems?',
                  answer: 'Absolutely. We support all major SCADA systems, ERP platforms, and can create custom integrations via REST APIs and webhooks.'
                },
                {
                  id: 'faq-4',
                  question: 'Is it compliant with industry regulations?',
                  answer: 'Yes. Our platform meets all major oil & gas industry standards including API, ISO, OSHA, and regional regulations. We provide automated compliance reporting.'
                },
                {
                  id: 'faq-5',
                  question: 'What kind of support do you provide?',
                  answer: '24/7 dedicated support with industry expertise. Enterprise customers get a dedicated account manager and priority response times.'
                },
                {
                  id: 'faq-6',
                  question: 'Can we customize workflows for our specific needs?',
                  answer: 'Yes! While we provide standard templates, all workflows are fully customizable. Our team can help configure the platform to match your exact processes.'
                }
              ]
            },
            style: { layout: 'single', defaultOpen: false, showNumbers: true }
          },

          // Final CTA
          {
            id: 'cta-1',
            type: 'cta',
            order: 11,
            data: {
              title: 'Ready to Transform Your Oil & Gas Operations?',
              description: 'Join 200+ energy companies already optimizing field operations with IVAFlow. Book a personalized demo today.',
              primaryButton: { text: 'Schedule Demo', href: '/contact', variant: 'primary', size: 'lg' },
              secondaryButton: { text: 'Start Free Trial', href: '/contact', variant: 'outline', size: 'lg' }
            },
            style: { gradient: 'from-amber-500 via-orange-500 to-blue-600' }
          }
        ]
      })
    }
  });

  console.log('✅ Advanced Oil & Gas page created successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
