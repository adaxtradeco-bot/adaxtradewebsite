import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedHomePage() {
  const builderData = {
    sections: [
      {
        id: 'hero-slider-1',
        type: 'hero-slider',
        order: 0,
        data: {
          slides: [
            {
              title: 'Where Operations Finally Flow.',
              subtitle: 'The OS for Modern Operations',
              description: 'Unify people, processes, and devices. Build enterprise-grade apps in minutes with AI assistance.',
              tag: '⚡ The OS for Modern Operations',
              backgroundImage: '/assets/img/1.png',
              buttons: [
                { text: 'Explore Platform →', href: '#platform', variant: 'primary' },
                { text: 'Talk to Sales', href: '#contact', variant: 'secondary' },
              ],
            },
            {
              title: 'Real-Time Visibility for Every Asset.',
              subtitle: 'Intelligent Fleet',
              description: 'Connect fleet, sensors, and drivers. Automated dispatch and predictive maintenance in one view.',
              tag: '🚚 Intelligent Fleet',
              backgroundImage: '/assets/img/4.png',
              buttons: [
                { text: 'View Fleet Solution →', href: '/en/fleet-management', variant: 'primary' },
              ],
            },
            {
              title: 'Data Collection, Reimagined.',
              subtitle: 'Smart Forms',
              description: 'Offline-ready forms with conditional logic. Validate data at the source, anywhere.',
              tag: '📝 Smart Forms',
              backgroundImage: '/assets/img/Smart2.png',
              buttons: [
                { text: 'Try Form Builder →', href: '/en/form-builder', variant: 'primary' },
              ],
            },
          ],
          autoplay: true,
          interval: 5000,
        },
        style: {},
      },
      {
        id: 'stakeholder-1',
        type: 'stakeholder',
        order: 1,
        data: {
          title: 'Solve the Problems of Key Stakeholders',
          subtitle: 'Key Stakeholders',
          description: 'IVAFlow connects the field, office, and leadership with clarity and automation.',
          stakeholders: [
            {
              title: 'Operations Manager',
              image: '/assets/img/stakeholder-ops.png',
              quote: 'I don\'t know the team\'s status until end-of-day.',
              solution: 'Real-time dashboards + GPS visibility',
            },
            {
              title: 'IT Director / CTO',
              image: '/assets/img/stakeholder-it.png',
              quote: 'My backlog is 6 months long.',
              solution: 'Secure No-Code governance control',
            },
            {
              title: 'Field Technician',
              image: '/assets/img/stakeholder-field.png',
              quote: 'No internet. Lost photos. Paper forms.',
              solution: 'Offline-first mobile app + auto sync',
            },
            {
              title: 'Executive / CEO',
              image: '/assets/img/stakeholder-ceo.png',
              quote: 'Issues reach me too late.',
              solution: 'Unified visibility across workflows',
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
        id: 'platform-tabs-1',
        type: 'platform-tabs',
        order: 2,
        data: {
          title: 'The Complete Automation Ecosystem',
          subtitle: 'The Platform',
          description: 'One unified OS for all your operational needs.',
          tabs: [
            {
              id: 'core',
              label: 'By Core Feature',
              cards: [
                {
                  title: 'Smart Forms',
                  description: 'Intelligent data capture with offline support, photo uploads, and real-time validation.',
                  image: '/assets/img/2.png',
                  link: '/en/form-builder',
                },
                {
                  title: 'Workflow & Automation',
                  description: 'Visually orchestrate complex logic, approvals, and "if-this-then-that" automated rules.',
                  image: '/assets/img/5.png',
                  link: '/en/workflow-orchestrator',
                },
                {
                  title: 'Analytics',
                  description: 'Turn raw data into decisions with real-time, customizable dashboards and reports.',
                  image: '/assets/img/Analytics3.png',
                  link: '#',
                },
                {
                  title: 'No-Code Apps',
                  description: 'Build branded, mobile-responsive employee portals instantly without writing code.',
                  image: '/assets/img/Nocode4.png',
                  link: '/en/app-builder',
                },
              ],
            },
            {
              id: 'industry',
              label: 'By Industry',
              cards: [
                {
                  title: 'Fleet Management',
                  description: 'End-to-end dispatching, tracking, and maintenance.',
                  image: '/assets/img/4.png',
                  link: '/en/fleet-management',
                },
                {
                  title: 'Construction',
                  description: 'Manage site inspections and safety reporting.',
                  image: '/assets/img/1.png',
                  link: '/en/industries/construction',
                },
                {
                  title: 'Healthcare',
                  description: 'Secure patient intake and compliance.',
                  image: '/assets/img/2.png',
                  link: '/en/industries/healthcare',
                },
                {
                  title: 'Oil & Gas',
                  description: 'Remote asset monitoring and HSE.',
                  image: '/assets/img/Remoteasset3.png',
                  link: '/en/industries/oilgas',
                },
              ],
            },
            {
              id: 'usecase',
              label: 'By Use Case',
              cards: [
                {
                  title: 'Approvals',
                  description: 'Streamline internal requests and sign-offs.',
                  image: '/assets/img/approval5.png',
                  link: '#',
                },
                {
                  title: 'Onboarding',
                  description: 'Automate document collection and training.',
                  image: '/assets/img/Onboard2.png',
                  link: '#',
                },
                {
                  title: 'Incident Mgmt',
                  description: 'Report and resolve safety incidents instantly.',
                  image: '/assets/img/Incident3.png',
                  link: '#',
                },
                {
                  title: 'Field Service',
                  description: 'Track work orders in field.',
                  image: '/assets/img/Field1.png',
                  link: '#',
                },
              ],
            },
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
        id: 'why-1',
        type: 'why',
        order: 3,
        data: {
          title: 'The Unified Operational Backbone for Modern Enterprises',
          subtitle: 'Why IVAFlow?',
          description: 'IVAFlow replaces fragmented tools with a secure, governed, AI-powered platform that brings clarity, speed, and consistency to every operation.',
          features: [
            {
              title: 'End-to-End Operational Alignment',
              description: 'Forms, workflows, data models, field operations, and dashboards work together in one governed system eliminating duplicate work.',
            },
            {
              title: 'No-Code with Enterprise Governance',
              description: 'Business teams build apps and workflows at startup speed, while IT maintains full control over access, security, compliance, and lifecycle management.',
            },
            {
              title: 'Real-Time Visibility & Intelligence',
              description: 'Live dashboards, SLA tracking, GPS-enabled field insights, and AI suggestions ensure leaders see issues early and act with confidence.',
            },
          ],
          ctaText: 'Discover the Advantage →',
          ctaLink: '#',
          backgroundImage: '/assets/img/1.png',
        },
        style: {
          backgroundColor: 'bg-slate-900',
          textColor: 'text-white',
          padding: 'py-24',
        },
      },
      {
        id: 'experience-tabs-1',
        type: 'experience-tabs',
        order: 4,
        data: {
          title: 'See the Platform in Action',
          subtitle: 'Experience It',
          description: 'A user interface designed for efficiency. Click below to explore.',
          tabs: [
            {
              id: 'forms',
              label: 'Form Builder',
              icon: '📝',
              title: 'Intelligent Form Builder',
              description: 'Easily design complex, multi-page forms with conditional logic. Capture data online or offline, and validate inputs in real-time to ensure data integrity.',
              image: '/assets/img/UI-Forms2.png',
              link: '/en/form-builder',
            },
            {
              id: 'workflow',
              label: 'Workflows',
              icon: '⚡',
              title: 'Visual Workflow Designer',
              description: 'Map out business processes using a simple drag-and-drop canvas. Automate approvals, route tasks based on rules, and eliminate manual handoffs.',
              image: '/assets/img/UI-Workflow5.png',
              link: '/en/workflow-orchestrator',
            },
            {
              id: 'dashboard',
              label: 'Dashboards',
              icon: '📊',
              title: 'Real-Time Analytics',
              description: 'Gain instant visibility into your operations. Build custom dashboards to track KPIs, monitor asset health, and spot trends before they become problems.',
              image: '/assets/img/Analytics3.png',
              link: '#',
            },
            {
              id: 'iot',
              label: 'IoT & Fleet',
              icon: '📡',
              title: 'IoT & Fleet Tracking',
              description: 'Seamlessly integrate physical assets into your digital workflows. Monitor GPS location, sensor data, and equipment status in real-time.',
              image: '/assets/img/4.png',
              link: '/en/industries/iot-integration',
            },
          ],
        },
        style: {
          backgroundColor: 'bg-white',
          textColor: 'text-slate-900',
          padding: 'py-20',
        },
      },
      {
        id: 'video-1',
        type: 'video',
        order: 5,
        data: {
          title: 'See How Fast You Can Build.',
          subtitle: 'Watch Demo',
          description: 'From a blank canvas to a fully automated workflow in under 60 seconds. No coding required.',
          videoUrl: '/assets/img/videohome.mp4',
          posterUrl: '/assets/img/videocoverhome.png',
          features: [
            '<strong>Drag & Drop</strong> interface',
            '<strong>Instant</strong> deployment',
          ],
        },
        style: {
          backgroundColor: 'bg-slate-900',
          textColor: 'text-white',
          padding: 'py-24',
        },
      },
      {
        id: 'cta-1',
        type: 'cta',
        order: 6,
        data: {
          title: 'Ready to Rethink How Work Flows?',
          description: 'Join teams that turned ad-hoc processes into reliable, auditable workflows with IVAFlow.',
          buttons: [
            { text: 'Schedule Demo', href: '#', variant: 'secondary', size: 'lg' },
            { text: 'Start Free', href: '#', variant: 'primary', size: 'lg' },
          ],
        },
        style: {
          backgroundColor: 'bg-gradient-to-br from-slate-900 to-slate-800',
          textColor: 'text-white',
          padding: 'py-24',
          alignment: 'center',
        },
      },
    ],
  };

  await prisma.page.upsert({
    where: { slug: 'home' },
    update: {
      builderData: JSON.stringify(builderData),
      isBuilderPage: true,
      status: 'published',
    },
    create: {
      title: 'Home - IVAFlow',
      slug: 'home',
      metaTitle: 'IVAFlow — The Intelligent Automation Platform',
      metaDescription: 'Orchestrate people, processes, and things with AI-native automation. No code required.',
      status: 'published',
      language: 'en',
      builderData: JSON.stringify(builderData),
      isBuilderPage: true,
      builderVersion: '1.0',
    },
  });

  console.log('✅ Home page seeded successfully!');
}

seedHomePage()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
