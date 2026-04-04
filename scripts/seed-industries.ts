/**
 * Seed Industries Pages
 * Creates all 6 industries pages with default builder data
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Industries pages with complete sections...');

  // Main Industries Page
  const industriesPage = await prisma.page.upsert({
    where: { slug: 'industries' },
    update: {},
    create: {
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
            id: 'stats-1',
            type: 'stats',
            order: 1,
            data: {
              title: 'Trusted by Industry Leaders',
              stats: [
                { value: '500+', label: 'Enterprise Clients' },
                { value: '99.9%', label: 'Uptime SLA' },
                { value: '24/7', label: 'Support' },
                { value: '50+', label: 'Countries' }
              ]
            },
            style: {}
          },
          {
            id: 'benefits-1',
            type: 'benefit-grid',
            order: 2,
            data: {
              title: 'Why Choose Our Platform',
              subtitle: 'Built for Every Industry',
              benefits: [
                { icon: 'Zap', title: 'Fast Implementation', description: 'Get started in days, not months' },
                { icon: 'Shield', title: 'Enterprise Security', description: 'Bank-level security and compliance' },
                { icon: 'Users', title: 'Expert Support', description: '24/7 dedicated support team' },
                { icon: 'TrendingUp', title: 'Proven ROI', description: 'Average 300% return on investment' },
                { icon: 'Workflow', title: 'Custom Workflows', description: 'Tailored to your processes' },
                { icon: 'Globe', title: 'Global Scale', description: 'Operate across 50+ countries' }
              ]
            },
            style: { columns: 3 }
          },
          {
            id: 'features-1',
            type: 'industry-features',
            order: 3,
            data: {
              title: 'Comprehensive Features',
              description: 'Everything you need to transform your operations',
              features: [
                { icon: 'CheckCircle', title: 'Custom Workflows', description: 'Tailored to your processes' },
                { icon: 'CheckCircle', title: 'Real-time Analytics', description: 'Data-driven insights' },
                { icon: 'CheckCircle', title: 'Mobile Access', description: 'Work from anywhere' },
                { icon: 'CheckCircle', title: 'API Integration', description: 'Connect your systems' }
              ]
            },
            style: { imagePosition: 'right' }
          },
          {
            id: 'testimonials-1',
            type: 'testimonial',
            order: 4,
            data: {
              title: 'What Our Clients Say',
              subtitle: 'Success Stories from Industry Leaders',
              testimonials: [
                { quote: 'This platform transformed our operations completely', author: 'John Smith', role: 'CEO, TechCorp', avatar: '' },
                { quote: 'Best investment we made this year', author: 'Sarah Johnson', role: 'CTO, InnovateCo', avatar: '' },
                { quote: 'Support team is outstanding', author: 'Mike Chen', role: 'Director, GlobalTech', avatar: '' }
              ]
            },
            style: {}
          },
          {
            id: 'cta-1',
            type: 'cta',
            order: 5,
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
  const oilgasPage = await prisma.page.upsert({
    where: { slug: 'industries-oilgas' },
    update: {},
    create: {
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
              description: 'Streamline operations, enhance safety, and optimize production with our comprehensive platform',
              primaryButton: { text: 'Get Started', href: '/contact' },
              secondaryButton: { text: 'View Demo', href: '#demo' },
              stats: [
                { value: '40%', label: 'Cost Reduction' },
                { value: '99.9%', label: 'Safety Compliance' },
                { value: '24/7', label: 'Real-time Monitoring' }
              ]
            },
            style: { theme: 'oilgas', gradient: 'from-blue-900 to-amber-600' }
          },
          {
            id: 'stats-1',
            type: 'stats',
            order: 1,
            data: {
              title: 'Industry-Leading Performance',
              stats: [
                { value: '200+', label: 'Oil & Gas Companies' },
                { value: '5000+', label: 'Wells Monitored' },
                { value: '99.99%', label: 'System Uptime' },
                { value: '40%', label: 'Average Cost Savings' }
              ]
            },
            style: {}
          },
          {
            id: 'benefits-1',
            type: 'benefit-grid',
            order: 2,
            data: {
              title: 'Complete Oil & Gas Solutions',
              subtitle: 'Optimize Every Aspect of Your Operations',
              benefits: [
                { icon: 'Gauge', title: 'Production Optimization', description: 'Maximize output and efficiency with real-time data' },
                { icon: 'Shield', title: 'Safety Management', description: 'Real-time hazard monitoring and incident prevention' },
                { icon: 'Truck', title: 'Fleet Tracking', description: 'GPS tracking and route optimization for all vehicles' },
                { icon: 'BarChart', title: 'Predictive Analytics', description: 'AI-powered maintenance and production insights' },
                { icon: 'Users', title: 'Workforce Management', description: 'Scheduling, compliance, and certification tracking' },
                { icon: 'FileText', title: 'Regulatory Compliance', description: 'Automated reporting and documentation' }
              ]
            },
            style: { columns: 3 }
          },
          {
            id: 'features-1',
            type: 'industry-features',
            order: 3,
            data: {
              title: 'Advanced Features for Energy Sector',
              description: 'Purpose-built tools for upstream, midstream, and downstream operations',
              features: [
                { icon: 'Activity', title: 'Real-time Monitoring', description: 'Track all operations 24/7' },
                { icon: 'AlertTriangle', title: 'Safety Alerts', description: 'Instant notifications for hazards' },
                { icon: 'Database', title: 'Data Integration', description: 'Connect SCADA, ERP, and IoT systems' },
                { icon: 'FileCheck', title: 'Compliance Reports', description: 'Automated regulatory documentation' }
              ],
              details: [
                'SCADA integration',
                'IoT sensor connectivity',
                'Mobile field apps',
                'Offline mode support'
              ]
            },
            style: { imagePosition: 'right' }
          },
          {
            id: 'case-study-1',
            type: 'case-study',
            order: 4,
            data: {
              title: 'Success Story: Global Energy Corp',
              company: 'Global Energy Corp',
              logo: '',
              challenge: 'Manual processes causing production delays, safety risks, and compliance issues across 50+ sites',
              solution: 'Implemented our platform for real-time monitoring, automated workflows, and predictive maintenance',
              results: '40% cost reduction, 99.9% safety compliance, zero downtime incidents, 24/7 operational visibility',
              metrics: [
                { value: '40%', label: 'Cost Savings' },
                { value: '60%', label: 'Faster Response Time' },
                { value: '100%', label: 'Safety Compliance' },
                { value: '0', label: 'Downtime Incidents' }
              ]
            },
            style: {}
          },
          {
            id: 'testimonials-1',
            type: 'testimonial',
            order: 5,
            data: {
              title: 'What Energy Leaders Say',
              subtitle: 'Trusted by Major Oil & Gas Companies',
              testimonials: [
                { quote: 'This platform revolutionized our operations. Real-time visibility across all sites has been a game-changer.', author: 'James Wilson', role: 'VP Operations, PetroTech', avatar: '' },
                { quote: 'Safety compliance improved dramatically. The automated alerts prevented multiple potential incidents.', author: 'Maria Garcia', role: 'Safety Director, Energy Solutions', avatar: '' },
                { quote: 'ROI was achieved in 6 months. The predictive maintenance alone saved us millions.', author: 'David Chen', role: 'CTO, Global Oil Corp', avatar: '' }
              ]
            },
            style: {}
          },
          {
            id: 'timeline-1',
            type: 'timeline',
            order: 6,
            data: {
              title: 'Implementation Timeline',
              subtitle: 'Get Started in Weeks, Not Months',
              steps: [
                { title: 'Week 1-2: Discovery', description: 'Assess current systems and define requirements' },
                { title: 'Week 3-4: Setup', description: 'Configure platform and integrate existing systems' },
                { title: 'Week 5-6: Training', description: 'Train teams and conduct pilot deployment' },
                { title: 'Week 7-8: Launch', description: 'Full rollout with ongoing support' }
              ]
            },
            style: {}
          },
          {
            id: 'cta-1',
            type: 'cta',
            order: 7,
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

  // IoT Integration Page
  const iotPage = await prisma.page.upsert({
    where: { slug: 'industries-iot-integration' },
    update: {},
    create: {
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
            id: 'features-1',
            type: 'industry-features',
            order: 2,
            data: {
              title: 'Smart Integration',
              description: 'Connect sensors, devices, and systems seamlessly',
              features: [
                { icon: 'Cpu', title: 'Multi-Protocol Support', description: 'MQTT, CoAP, HTTP, WebSocket' },
                { icon: 'Database', title: 'Data Pipeline', description: 'Real-time data processing' },
                { icon: 'Bell', title: 'Smart Alerts', description: 'Automated notifications' }
              ]
            },
            style: { imagePosition: 'left' }
          }
        ]
      })
    }
  });

  // Real Estate Page
  const realestatePage = await prisma.page.upsert({
    where: { slug: 'industries-real-estate' },
    update: {},
    create: {
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
                { icon: 'DollarSign', title: 'Rent Collection', description: 'Automated payment processing' },
                { icon: 'FileText', title: 'Lease Management', description: 'Digital contracts and renewals' },
                { icon: 'BarChart', title: 'Financial Reports', description: 'Real-time insights' }
              ]
            },
            style: { columns: 3 }
          }
        ]
      })
    }
  });

  // Construction Page
  const constructionPage = await prisma.page.upsert({
    where: { slug: 'industries-construction' },
    update: {},
    create: {
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
            id: 'case-study-1',
            type: 'case-study',
            order: 2,
            data: {
              title: 'Project Success',
              company: 'BuildTech Construction',
              challenge: 'Delays and communication issues across multiple sites',
              solution: 'Centralized platform for project management and team coordination',
              results: '30% faster delivery, 100% compliance, zero safety incidents',
              metrics: [
                { value: '30%', label: 'Time Saved' },
                { value: '25%', label: 'Cost Reduction' },
                { value: '0', label: 'Safety Incidents' }
              ]
            },
            style: {}
          }
        ]
      })
    }
  });

  // Healthcare Page
  const healthcarePage = await prisma.page.upsert({
    where: { slug: 'industries-healthcare' },
    update: {},
    create: {
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
                { icon: 'Activity', title: 'Vital Monitoring', description: 'Real-time patient data' },
                { icon: 'Shield', title: 'HIPAA Compliance', description: 'Full regulatory compliance' },
                { icon: 'Users', title: 'Staff Management', description: 'Scheduling and credentials' }
              ]
            },
            style: { columns: 3 }
          },
          {
            id: 'features-1',
            type: 'industry-features',
            order: 2,
            data: {
              title: 'Complete Healthcare Platform',
              description: 'Everything you need for modern healthcare delivery',
              features: [
                { icon: 'FileText', title: 'EHR Integration', description: 'Connect with existing systems' },
                { icon: 'Video', title: 'Telemedicine', description: 'Virtual consultations' },
                { icon: 'Bell', title: 'Patient Alerts', description: 'Automated reminders' }
              ]
            },
            style: { imagePosition: 'right' }
          }
        ]
      })
    }
  });

  console.log('✅ Industries pages created:');
  console.log(`  - ${industriesPage.slug}`);
  console.log(`  - ${oilgasPage.slug}`);
  console.log(`  - ${iotPage.slug}`);
  console.log(`  - ${realestatePage.slug}`);
  console.log(`  - ${constructionPage.slug}`);
  console.log(`  - ${healthcarePage.slug}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
