import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedRealEstateBPMS() {
  const builderData = {
    sections: [
      {
        id: 'hero-1',
        type: 'hero',
        order: 0,
        data: {
          title: 'Real Estate BPMS Solutions',
          subtitle: 'Automate Your Property Management',
          description: 'Streamline operations, automate workflows, and manage properties efficiently with our intelligent BPMS platform designed specifically for real estate businesses.',
          buttons: [
            { text: 'Start Free Trial', href: '#', variant: 'primary', size: 'lg' },
            { text: 'Watch Demo', href: '#', variant: 'outline', size: 'lg' },
          ],
          badges: [
            { text: 'No-Code Platform', variant: 'success' },
            { text: 'AI-Powered', variant: 'info' },
          ],
        },
        style: {
          backgroundColor: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50',
          textColor: 'text-slate-900',
          padding: 'py-24 lg:py-32',
          alignment: 'center',
        },
      },
      {
        id: 'features-1',
        type: 'features',
        order: 1,
        data: {
          title: 'Powerful Features for Real Estate',
          subtitle: 'Everything you need to manage properties efficiently',
          items: [
            {
              title: 'Tenant Management',
              description: 'Complete tenant lifecycle management from application to move-out',
              icon: '👥',
            },
            {
              title: 'Lease Automation',
              description: 'Automated lease generation, renewals, and digital signatures',
              icon: '📄',
            },
            {
              title: 'Maintenance Tracking',
              description: 'Track maintenance requests, assign tasks, and monitor completion',
              icon: '🔧',
            },
            {
              title: 'Payment Processing',
              description: 'Automated rent collection, invoicing, and payment reminders',
              icon: '💳',
            },
            {
              title: 'Document Management',
              description: 'Centralized storage for contracts, inspections, and compliance docs',
              icon: '📁',
            },
            {
              title: 'Analytics & Reports',
              description: 'Real-time insights on occupancy, revenue, and performance metrics',
              icon: '📊',
            },
          ],
        },
        style: {
          backgroundColor: 'bg-white',
          textColor: 'text-slate-900',
          padding: 'py-20',
          alignment: 'center',
        },
      },
      {
        id: 'workflow-1',
        type: 'workflow',
        order: 2,
        data: {
          title: 'Automated Workflows',
          subtitle: 'Streamline your operations with intelligent automation',
          workflows: [
            {
              title: 'Lease Management',
              description: 'Automate lease agreements, renewals, and tenant onboarding',
              icon: '📄',
              steps: ['Application Review', 'Credit Check', 'Lease Generation', 'Digital Signature'],
            },
            {
              title: 'Maintenance Requests',
              description: 'Track and manage property maintenance from request to completion',
              icon: '🔧',
              steps: ['Request Submission', 'Vendor Assignment', 'Work Execution', 'Quality Check'],
            },
            {
              title: 'Payment Processing',
              description: 'Automated rent collection and payment tracking',
              icon: '💳',
              steps: ['Invoice Generation', 'Payment Collection', 'Reconciliation', 'Receipt Delivery'],
            },
          ],
        },
        style: {
          backgroundColor: 'bg-slate-50',
          textColor: 'text-slate-900',
          padding: 'py-20',
          alignment: 'left',
        },
      },
      {
        id: 'process-1',
        type: 'process',
        order: 3,
        data: {
          title: 'How It Works',
          subtitle: 'Get started in 4 simple steps',
          steps: [
            { title: 'Configure', description: 'Set up your properties and workflows', icon: '⚙️' },
            { title: 'Automate', description: 'Let the system handle repetitive tasks', icon: '🤖' },
            { title: 'Monitor', description: 'Track all activities in real-time', icon: '📊' },
            { title: 'Optimize', description: 'Improve based on data insights', icon: '🚀' },
          ],
        },
        style: {
          backgroundColor: 'bg-white',
          textColor: 'text-slate-900',
          padding: 'py-20',
          alignment: 'center',
        },
      },
      {
        id: 'integrations-1',
        type: 'integrations',
        order: 4,
        data: {
          title: 'Seamless Integrations',
          subtitle: 'Connect with your existing tools and systems',
          integrations: [
            { name: 'Accounting', icon: '💼', description: 'QuickBooks, Xero' },
            { name: 'Payments', icon: '💳', description: 'Stripe, PayPal' },
            { name: 'CRM', icon: '👥', description: 'Salesforce, HubSpot' },
            { name: 'Documents', icon: '📁', description: 'DocuSign, Adobe' },
            { name: 'Communication', icon: '📧', description: 'Email, SMS' },
            { name: 'Analytics', icon: '📊', description: 'Power BI, Tableau' },
          ],
        },
        style: {
          backgroundColor: 'bg-slate-50',
          textColor: 'text-slate-900',
          padding: 'py-20',
          alignment: 'center',
        },
      },
      {
        id: 'stats-1',
        type: 'stats',
        order: 5,
        data: {
          title: 'Proven Results',
          stats: [
            { value: 85, suffix: '%', label: 'Time Saved', icon: '⏱️', color: 'violet' },
            { value: 50, suffix: '%', label: 'Cost Reduction', icon: '💰', color: 'green' },
            { value: 99, suffix: '%', label: 'Accuracy Rate', icon: '✅', color: 'cyan' },
            { value: 24, suffix: '/7', label: 'Availability', icon: '🌐', color: 'orange' },
          ],
        },
        style: {
          backgroundColor: 'bg-gradient-to-r from-blue-900 to-indigo-900',
          textColor: 'text-white',
          padding: 'py-20',
          alignment: 'center',
        },
      },
      {
        id: 'testimonials-1',
        type: 'testimonials',
        order: 6,
        data: {
          title: 'What Our Clients Say',
          subtitle: 'Trusted by leading real estate companies',
          testimonials: [
            {
              name: 'John Smith',
              role: 'Property Manager, ABC Realty',
              content: 'This BPMS platform transformed our operations. We reduced manual work by 80% and improved tenant satisfaction significantly.',
              rating: 5,
              avatar: '👨💼',
            },
            {
              name: 'Sarah Williams',
              role: 'Operations Director, XYZ Properties',
              content: 'The automation capabilities are incredible. Lease processing that took days now takes minutes. Highly recommended!',
              rating: 5,
              avatar: '👩💼',
            },
            {
              name: 'Michael Brown',
              role: 'CEO, Real Estate Solutions',
              content: 'Best investment we made. The ROI was visible within the first month. Our team is more productive than ever.',
              rating: 5,
              avatar: '👨',
            },
          ],
        },
        style: {
          backgroundColor: 'bg-white',
          textColor: 'text-slate-900',
          padding: 'py-20',
          alignment: 'center',
        },
      },
      {
        id: 'cta-1',
        type: 'cta',
        order: 7,
        data: {
          title: 'Ready to Transform Your Real Estate Operations?',
          description: 'Join hundreds of property managers who automated their workflows and increased efficiency.',
          buttons: [
            { text: 'Start Free Trial', href: '#', variant: 'primary', size: 'lg' },
            { text: 'Schedule Demo', href: '#', variant: 'secondary', size: 'lg' },
          ],
        },
        style: {
          backgroundColor: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600',
          textColor: 'text-white',
          padding: 'py-20',
          alignment: 'center',
        },
      },
    ],
  };

  await prisma.page.upsert({
    where: { slug: 'industries-real-estate' },
    update: {
      builderData: JSON.stringify(builderData),
      isBuilderPage: true,
      status: 'published',
    },
    create: {
      title: 'Real Estate BPMS Solutions',
      slug: 'industries-real-estate',
      metaTitle: 'Real Estate BPMS Solutions - IVAFlow',
      metaDescription: 'Automate property management with intelligent BPMS workflows',
      status: 'published',
      language: 'en',
      builderData: JSON.stringify(builderData),
      isBuilderPage: true,
      builderVersion: '1.0',
    },
  });

  console.log('✅ Real Estate BPMS page seeded successfully!');
}

seedRealEstateBPMS()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
