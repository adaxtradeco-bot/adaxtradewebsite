/**
 * Simple Industries Seed - Using Only Working Sections
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Industries pages (simple version)...');

  await prisma.page.deleteMany({
    where: { slug: { startsWith: 'industries' } }
  });

  // Main Industries Page
  await prisma.page.create({
    data: {
      slug: 'industries',
      title: 'Industries',
      metaDescription: 'Industry-specific solutions',
      status: 'published',
      isBuilderPage: true,
      builderData: JSON.stringify({
        sections: [
          {
            id: 'hero-1',
            type: 'industry-hero',
            order: 0,
            data: {
              title: 'Industry Solutions',
              subtitle: 'Tailored for Your Sector',
              description: 'Discover how our platform transforms operations across industries',
              primaryButton: { text: 'Explore Solutions', href: '#solutions' },
              secondaryButton: { text: 'Contact Sales', href: '/contact' },
              stats: [
                { value: '50+', label: 'Industries Served' },
                { value: '10K+', label: 'Active Clients' },
                { value: '99.9%', label: 'Uptime SLA' }
              ]
            },
            style: { theme: 'default', gradient: 'from-violet-600 to-cyan-600' }
          },
          {
            id: 'benefits-1',
            type: 'benefit-grid',
            order: 1,
            data: {
              title: 'Why Choose Our Platform',
              subtitle: 'Built for Every Industry',
              benefits: [
                { icon: 'Zap', title: 'Fast Implementation', description: 'Get started in days, not months' },
                { icon: 'Shield', title: 'Enterprise Security', description: 'Bank-level security and compliance' },
                { icon: 'Users', title: 'Expert Support', description: '24/7 dedicated support team' },
                { icon: 'TrendingUp', title: 'Proven ROI', description: 'Average 300% return on investment' }
              ]
            },
            style: { columns: 4 }
          },
          {
            id: 'cta-1',
            type: 'cta',
            order: 2,
            data: {
              title: 'Ready to Transform Your Industry?',
              description: 'Join thousands of companies already using our platform',
              primaryButton: { text: 'Get Started', href: '/contact' },
              secondaryButton: { text: 'Book Demo', href: '/contact' }
            },
            style: {}
          }
        ]
      })
    }
  });

  // Oil & Gas Page
  await prisma.page.create({
    data: {
      slug: 'industries-oilgas',
      title: 'Oil & Gas Solutions',
      metaDescription: 'Digital transformation for energy sector',
      status: 'published',
      isBuilderPage: true,
      builderData: JSON.stringify({
        sections: [
          {
            id: 'hero-1',
            type: 'industry-hero',
            order: 0,
            data: {
              title: 'Oil & Gas Digital Transformation',
              subtitle: 'Powering the Energy Sector',
              description: 'Streamline operations, enhance safety, and optimize production',
              primaryButton: { text: 'Get Started', href: '/contact' },
              secondaryButton: { text: 'View Demo', href: '#demo' },
              stats: [
                { value: '40%', label: 'Cost Reduction' },
                { value: '99.9%', label: 'Safety Compliance' },
                { value: '24/7', label: 'Monitoring' }
              ]
            },
            style: { theme: 'oilgas', gradient: 'from-blue-900 to-amber-600' }
          },
          {
            id: 'benefits-1',
            type: 'benefit-grid',
            order: 1,
            data: {
              title: 'Complete Oil & Gas Solutions',
              subtitle: 'Optimize Every Aspect',
              benefits: [
                { icon: 'Gauge', title: 'Production Optimization', description: 'Maximize output and efficiency' },
                { icon: 'Shield', title: 'Safety Management', description: 'Real-time hazard monitoring' },
                { icon: 'Truck', title: 'Fleet Tracking', description: 'GPS and route optimization' },
                { icon: 'BarChart', title: 'Analytics', description: 'Predictive maintenance insights' },
                { icon: 'Users', title: 'Workforce Management', description: 'Scheduling and compliance' },
                { icon: 'FileText', title: 'Compliance', description: 'Automated reporting' }
              ]
            },
            style: { columns: 3 }
          },
          {
            id: 'case-study-1',
            type: 'case-study',
            order: 2,
            data: {
              title: 'Success Story',
              subtitle: 'How Global Energy Corp Transformed Operations',
              caseStudies: [
                {
                  id: 'cs-1',
                  company: 'Global Energy Corp',
                  industry: 'Oil & Gas',
                  challenge: 'Manual processes causing delays and safety risks across 50+ sites',
                  solution: 'Implemented our platform for real-time monitoring and automation',
                  results: [
                    '40% cost reduction',
                    '99.9% safety compliance',
                    '24/7 operational visibility',
                    'Zero downtime incidents'
                  ]
                }
              ]
            },
            style: { layout: 'grid' }
          },
          {
            id: 'cta-1',
            type: 'cta',
            order: 3,
            data: {
              title: 'Ready to Transform Your Oil & Gas Operations?',
              description: 'Join 200+ energy companies already optimizing with our platform',
              primaryButton: { text: 'Schedule Demo', href: '/contact' },
              secondaryButton: { text: 'Download Brochure', href: '/resources' }
            },
            style: {}
          }
        ]
      })
    }
  });

  // IoT Integration
  await prisma.page.create({
    data: {
      slug: 'industries-iot-integration',
      title: 'IoT Integration Solutions',
      metaDescription: 'Connected devices and smart systems',
      status: 'published',
      isBuilderPage: true,
      builderData: JSON.stringify({
        sections: [
          {
            id: 'hero-1',
            type: 'industry-hero',
            order: 0,
            data: {
              title: 'IoT Integration Platform',
              subtitle: 'Connect Everything',
              description: 'Seamlessly integrate and manage IoT devices at scale',
              primaryButton: { text: 'Start Integration', href: '/contact' },
              stats: [
                { value: '1M+', label: 'Connected Devices' },
                { value: '<100ms', label: 'Latency' },
                { value: '99.99%', label: 'Reliability' }
              ]
            },
            style: { theme: 'iot', gradient: 'from-teal-600 to-green-500' }
          },
          {
            id: 'benefits-1',
            type: 'benefit-grid',
            order: 1,
            data: {
              title: 'IoT Capabilities',
              subtitle: 'Enterprise-Grade Integration',
              benefits: [
                { icon: 'Wifi', title: 'Device Management', description: 'Connect and control millions of devices' },
                { icon: 'Activity', title: 'Real-time Data', description: 'Instant insights and monitoring' },
                { icon: 'Lock', title: 'Secure Communication', description: 'End-to-end encryption' },
                { icon: 'Zap', title: 'Edge Computing', description: 'Process data at the edge' }
              ]
            },
            style: { columns: 4 }
          },
          {
            id: 'cta-1',
            type: 'cta',
            order: 2,
            data: {
              title: 'Ready to Connect Your Devices?',
              description: 'Start your IoT journey today',
              primaryButton: { text: 'Get Started', href: '/contact' },
              secondaryButton: { text: 'View Demo', href: '/contact' }
            },
            style: {}
          }
        ]
      })
    }
  });

  // Real Estate
  await prisma.page.create({
    data: {
      slug: 'industries-real-estate',
      title: 'Real Estate Solutions',
      metaDescription: 'Property management solutions',
      status: 'published',
      isBuilderPage: true,
      builderData: JSON.stringify({
        sections: [
          {
            id: 'hero-1',
            type: 'industry-hero',
            order: 0,
            data: {
              title: 'Real Estate Management',
              subtitle: 'Simplify Property Operations',
              description: 'Manage properties, tenants, and maintenance effortlessly',
              primaryButton: { text: 'Book Demo', href: '/contact' },
              stats: [
                { value: '10K+', label: 'Properties Managed' },
                { value: '95%', label: 'Tenant Satisfaction' },
                { value: '50%', label: 'Time Saved' }
              ]
            },
            style: { theme: 'realestate', gradient: 'from-slate-700 to-yellow-500' }
          },
          {
            id: 'benefits-1',
            type: 'benefit-grid',
            order: 1,
            data: {
              title: 'Property Management Made Easy',
              subtitle: 'All-in-One Solution',
              benefits: [
                { icon: 'Home', title: 'Property Listings', description: 'Manage all properties in one place' },
                { icon: 'Users', title: 'Tenant Portal', description: 'Self-service for tenants' },
                { icon: 'Wrench', title: 'Maintenance', description: 'Track and schedule repairs' },
                { icon: 'DollarSign', title: 'Rent Collection', description: 'Automated payment processing' }
              ]
            },
            style: { columns: 4 }
          },
          {
            id: 'cta-1',
            type: 'cta',
            order: 2,
            data: {
              title: 'Transform Your Property Management',
              description: 'Join thousands of property managers',
              primaryButton: { text: 'Get Started', href: '/contact' },
              secondaryButton: { text: 'Learn More', href: '/contact' }
            },
            style: {}
          }
        ]
      })
    }
  });

  // Construction
  await prisma.page.create({
    data: {
      slug: 'industries-construction',
      title: 'Construction Solutions',
      metaDescription: 'Project and site management',
      status: 'published',
      isBuilderPage: true,
      builderData: JSON.stringify({
        sections: [
          {
            id: 'hero-1',
            type: 'industry-hero',
            order: 0,
            data: {
              title: 'Construction Project Management',
              subtitle: 'Build Smarter, Faster',
              description: 'Coordinate teams, track progress, and deliver on time',
              primaryButton: { text: 'Start Project', href: '/contact' },
              stats: [
                { value: '30%', label: 'Faster Delivery' },
                { value: '100%', label: 'Compliance' },
                { value: '500+', label: 'Projects Completed' }
              ]
            },
            style: { theme: 'construction', gradient: 'from-orange-600 to-gray-600' }
          },
          {
            id: 'benefits-1',
            type: 'benefit-grid',
            order: 1,
            data: {
              title: 'Construction Solutions',
              subtitle: 'From Planning to Completion',
              benefits: [
                { icon: 'Hammer', title: 'Project Planning', description: 'Gantt charts and scheduling' },
                { icon: 'Users', title: 'Team Coordination', description: 'Real-time collaboration' },
                { icon: 'Camera', title: 'Site Documentation', description: 'Photo and video tracking' },
                { icon: 'ClipboardCheck', title: 'Quality Control', description: 'Inspection checklists' }
              ]
            },
            style: { columns: 4 }
          },
          {
            id: 'cta-1',
            type: 'cta',
            order: 2,
            data: {
              title: 'Build Better Projects',
              description: 'Start managing construction projects efficiently',
              primaryButton: { text: 'Get Started', href: '/contact' },
              secondaryButton: { text: 'View Features', href: '/contact' }
            },
            style: {}
          }
        ]
      })
    }
  });

  // Healthcare
  await prisma.page.create({
    data: {
      slug: 'industries-healthcare',
      title: 'Healthcare Solutions',
      metaDescription: 'Patient care and medical systems',
      status: 'published',
      isBuilderPage: true,
      builderData: JSON.stringify({
        sections: [
          {
            id: 'hero-1',
            type: 'industry-hero',
            order: 0,
            data: {
              title: 'Healthcare Management System',
              subtitle: 'Better Care, Better Outcomes',
              description: 'Streamline patient care, records, and hospital operations',
              primaryButton: { text: 'Learn More', href: '/contact' },
              stats: [
                { value: '100K+', label: 'Patients Served' },
                { value: 'HIPAA', label: 'Compliant' },
                { value: '24/7', label: 'Support' }
              ]
            },
            style: { theme: 'healthcare', gradient: 'from-blue-600 to-green-500' }
          },
          {
            id: 'benefits-1',
            type: 'benefit-grid',
            order: 1,
            data: {
              title: 'Healthcare Solutions',
              subtitle: 'Patient-Centered Care',
              benefits: [
                { icon: 'Heart', title: 'Patient Records', description: 'Secure electronic health records' },
                { icon: 'Calendar', title: 'Appointment Scheduling', description: 'Online booking system' },
                { icon: 'Pill', title: 'Prescription Management', description: 'Digital prescriptions' },
                { icon: 'Activity', title: 'Vital Monitoring', description: 'Real-time patient data' }
              ]
            },
            style: { columns: 4 }
          },
          {
            id: 'cta-1',
            type: 'cta',
            order: 2,
            data: {
              title: 'Improve Patient Care',
              description: 'Modern healthcare management for modern hospitals',
              primaryButton: { text: 'Schedule Demo', href: '/contact' },
              secondaryButton: { text: 'Learn More', href: '/contact' }
            },
            style: {}
          }
        ]
      })
    }
  });

  console.log('✅ All 6 Industries pages created successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
