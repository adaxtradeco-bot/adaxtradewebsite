import { Metadata } from 'next';

import IndustryHeroSection from '@/components/builder-sections/IndustryHeroSection';
import IndustryCardsSection from '@/components/builder-sections/IndustryCardsSection';
import CTASection from '@/components/builder-sections/CTASection';

export const metadata: Metadata = {
  title: 'Industry Solutions - IVAFlow',
  description: 'Built for Your Industry. See how teams in fleet, construction, healthcare, government and more transform operations with AI-native no-code automation.',
};

interface PageProps {
  params: { lang: string };
}

export default function IndustriesPage({ params }: PageProps) {

  const heroSection = {
    id: 'hero-industries',
    type: 'industry-hero' as const,
    order: 0,
    data: {
      title: "Built for Your Industry",
      subtitle: "Transform Operations with AI-Native Automation",
      description: "See how teams in fleet, construction, healthcare, government and more transform operations with AI-native no-code automation.",
      icon: "🏭",
      buttons: [
        {
          text: "Explore Solutions",
          href: "#solutions",
          variant: 'primary' as const,
          size: 'lg' as const
        },
        {
          text: "Book Demo",
          href: "/contact",
          variant: 'outline' as const,
          size: 'lg' as const
        }
      ],
      textAlign: 'center' as const
    },
    style: {
      backgroundColor: 'bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900',
      textColor: 'text-white',
      padding: 'py-20',
      minHeight: '70vh'
    }
  };

  const industriesData = {
    title: "Tailored for Complex Operations",
    subtitle: "Ready-to-run building blocks you can tailor in minutes.",
    cards: [
      {
        id: 'fleet',
        title: 'Fleet & Logistics',
        icon: '🚚',
        description: 'Optimize your entire fleet with real-time tracking, automated dispatching, and route intelligence.',
        features: [
          'Vehicle GPS + geofencing',
          'Automated dispatch & routes',
          'Driver check-in/out with proof',
          'Fuel & maintenance tracking',
          'Delivery proof (photo + GPS)',
          'Performance dashboards'
        ],
        link: '/industries/fleet-management',
        color: 'blue',
        ctaText: 'View Fleet Solution',
        ctaLink: '/industries/fleet-management'
      },
      {
        id: 'construction',
        title: 'Construction',
        icon: '⚒️',
        description: 'Run mobile-first site inspections, safety, and asset tracking—connected to approvals and reports.',
        features: [
          'Site inspections (photo evidence)',
          'Equipment logs & maintenance',
          'Safety checklists & incidents',
          'Attendance with geofencing',
          'Progress documentation',
          'Contractor management'
        ],
        link: '/industries/construction',
        color: 'orange',
        ctaText: 'View Construction Solution',
        ctaLink: '/industries/construction'
      },
      {
        id: 'oilgas',
        title: 'Oil & Gas',
        icon: '🛢️',
        description: 'Safeguard remote ops with offline forms, HSE compliance, and IoT monitoring.',
        features: [
          'Asset inspections (offline)',
          'HSE reporting & compliance',
          'Incident management & escalation',
          'Maintenance scheduling',
          'IoT sensor integration',
          'Regulatory documentation'
        ],
        link: '/industries/oilgas',
        color: 'gray',
        ctaText: 'View Oil & Gas Solution',
        ctaLink: '/industries/oilgas'
      },
      {
        id: 'healthcare',
        title: 'Healthcare',
        icon: '🏥',
        description: 'Streamline patient journeys with intake forms, scheduling, and compliant documentation.',
        features: [
          'Patient intake & registration',
          'Scheduling automation',
          'Equipment maintenance',
          'Compliance workflows',
          'Shift scheduling',
          'HIPAA-aligned handling'
        ],
        link: '/industries/healthcare',
        color: 'green',
        ctaText: 'View Healthcare Solution',
        ctaLink: '/industries/healthcare'
      },
      {
        id: 'government',
        title: 'Government',
        icon: '🏛️',
        description: 'Digitize citizen services and internal approvals with secure, compliant automation.',
        features: [
          'Service request management',
          'Permit & license approvals',
          'Inspection & compliance',
          'Inter-department coordination',
          'Public record management',
          'RBAC, SSO, audit trails'
        ],
        link: '/contact',
        color: 'purple',
        ctaText: 'View Government Solution',
        ctaLink: '/contact'
      },
      {
        id: 'retail',
        title: 'Retail',
        icon: '🛍️',
        description: 'Automate inventory, audits, and service ops—across all stores and regions.',
        features: [
          'Inventory tracking & replenishment',
          'Store audits & inspections',
          'Customer service requests',
          'Scheduling & attendance',
          'Promo/campaign management',
          'Multi-location dashboards'
        ],
        link: '/contact',
        color: 'pink',
        ctaText: 'View Retail Solution',
        ctaLink: '/contact'
      },
      {
        id: 'manufacturing',
        title: 'Manufacturing',
        icon: '🏭',
        description: 'Connect the shop floor with IoT telemetry, QC workflows, and maintenance requests.',
        features: [
          'Production monitoring (IoT)',
          'Quality checks & inspections',
          'Maintenance requests',
          'Supply-chain coordination',
          'Safety incident reports',
          'Real-time KPIs'
        ],
        link: '/industries/iot-integration',
        color: 'indigo',
        ctaText: 'View Manufacturing Solution',
        ctaLink: '/industries/iot-integration'
      },
      {
        id: 'startups',
        title: 'Startups',
        icon: '🚀',
        description: 'Ship internal tools faster than hiring: CRM, HR, ops systems—without code.',
        features: [
          'Custom CRM',
          'HR onboarding & Mgmt',
          'Inventory & assets',
          'Support ticketing',
          'Project workflows',
          'Team collaboration'
        ],
        link: '/contact',
        color: 'cyan',
        ctaText: 'View Startup Solution',
        ctaLink: '/contact'
      }
    ]
  };

  const ctaData = {
    title: "Don't See Your Industry?",
    description: "IVAFlow adapts to any process. Book a demo—we'll map your exact workflow in minutes.",
    primaryButton: {
      text: "Schedule Demo",
      link: "/contact"
    },
    secondaryButton: {
      text: "Contact Sales",
      link: "/contact"
    }
  };

  return (
    <main className="min-h-screen">
      <IndustryHeroSection section={heroSection} />
      <section id="solutions" className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold uppercase tracking-wide mb-4">
              Industry Solutions
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              {industriesData.title}
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              {industriesData.subtitle}
            </p>
          </div>
          <IndustryCardsSection data={industriesData} style={{ columns: 2 }} />
        </div>
      </section>
      <CTASection data={ctaData} style={{ variant: 'gradient', alignment: 'center', size: 'lg' }} />
    </main>
  );
}
