import { Metadata } from 'next';

import { HeroSection } from '@/components/builder-sections/HeroSection';
import FeatureGridSection from '@/components/builder-sections/FeatureGridSection';
import WorkflowSection from '@/components/builder-sections/WorkflowSection';
import StatsSection from '@/components/builder-sections/StatsSection';
import CTASection from '@/components/builder-sections/CTASection';
import CaseStudySection from '@/components/builder-sections/CaseStudySection';

export const metadata: Metadata = {
  title: 'Construction Solutions - IVAFlow',
  description: 'Construction Automation That Works On-Site. Digitize your construction operations with mobile-first forms, GPS tracking, photo documentation, and offline capability.',
};

interface PageProps {
  params: { lang: string };
}

export default function ConstructionPage({ params }: PageProps) {

  const heroSection = {
    id: 'hero-construction',
    type: 'hero' as const,
    order: 0,
    data: {
      title: "Construction Automation That Works On-Site",
      subtitle: "Digitize your construction operations with mobile-first forms, GPS tracking, photo documentation, and offline capability. Built for the field.",
      description: "Transform your construction operations with digital tools designed for harsh environments and remote locations.",
      buttons: [
        {
          text: "Get Started",
          href: "/contact",
          variant: 'primary' as const,
          size: 'lg' as const
        },
        {
          text: "Watch Demo",
          href: "/contact",
          variant: 'secondary' as const,
          size: 'lg' as const
        }
      ]
    },
    style: {
      backgroundColor: 'bg-gradient-to-br from-slate-900 via-orange-900 to-orange-800',
      textColor: 'text-white',
      padding: 'py-20',
      alignment: 'center' as const
    }
  };

  const heroStatsData = {
    title: "",
    subtitle: "",
    stats: [
      {
        value: 40,
        suffix: '%',
        label: 'Time Saved',
        icon: '⏱️',
        color: 'orange'
      },
      {
        value: 85,
        suffix: '%',
        label: 'Less Paperwork',
        icon: '📋',
        color: 'green'
      },
      {
        value: 100,
        suffix: '%',
        label: 'Compliance',
        icon: '✅',
        color: 'blue'
      }
    ]
  };

  const challengesData = {
    title: "Construction Pain Points We Solve",
    subtitle: "The unique challenges of managing construction projects and field teams",
    features: [
      {
        id: 'challenge-1',
        icon: "📋",
        title: "Paper-Based Processes",
        description: "Clipboards, paper forms, manual data entry—wasting hours every day and prone to errors and loss.",
        color: 'red'
      },
      {
        id: 'challenge-2',
        icon: "📍", 
        title: "Poor Field Visibility",
        description: "No real-time view of worker locations, equipment status, or project progress across multiple sites.",
        color: 'orange'
      },
      {
        id: 'challenge-3',
        icon: "⚠️",
        title: "Safety Compliance", 
        description: "Tracking safety inspections, incident reports, and regulatory compliance is manual and time-consuming.",
        color: 'yellow'
      },
      {
        id: 'challenge-4',
        icon: "🔧",
        title: "Equipment Management",
        description: "Difficult to track equipment location, maintenance schedules, and usage across job sites.",
        color: 'blue'
      }
    ]
  };

  const solutionsData = {
    title: "Digital Tools Built for Construction",
    subtitle: "Everything you need to run efficient, compliant construction operations",
    workflows: [
      {
        id: 'solution-1',
        title: "Mobile Site Inspections",
        description: "Conduct site inspections digitally with photo capture, GPS location, and instant reporting.",
        icon: "📱",
        steps: [
          "Custom inspection checklists",
          "Photo + GPS proof",
          "Offline mode capability",
          "Instant report generation"
        ]
      },
      {
        id: 'solution-2',
        title: "Safety Management",
        description: "Track safety incidents, toolbox talks, and compliance documentation automatically.",
        icon: "⚠️",
        steps: [
          "Incident reporting workflows",
          "Safety checklist automation",
          "Compliance tracking",
          "Alert notifications"
        ]
      },
      {
        id: 'solution-3',
        title: "Worker Management",
        description: "Track attendance, certifications, and worker assignments with GPS geofencing.",
        icon: "👷",
        steps: [
          "GPS-based check-in/out",
          "Certification tracking",
          "Time sheet automation",
          "Shift scheduling"
        ]
      },
      {
        id: 'solution-4',
        title: "Equipment Tracking",
        description: "Monitor equipment location, maintenance, and usage across all your sites.",
        icon: "🔧",
        steps: [
          "Asset tracking with GPS",
          "Maintenance scheduling",
          "Usage logs",
          "Service history"
        ]
      },
      {
        id: 'solution-5',
        title: "Document Management",
        description: "Store and share plans, permits, contracts, and photos in one secure location.",
        icon: "📄",
        steps: [
          "Centralized document storage",
          "Version control",
          "Role-based access",
          "Mobile access"
        ]
      },
      {
        id: 'solution-6',
        title: "Progress Tracking",
        description: "Monitor project milestones, daily reports, and completion status in real-time.",
        icon: "📊",
        steps: [
          "Daily progress reports",
          "Milestone tracking",
          "Photo documentation",
          "Client portals"
        ]
      }
    ]
  };

  const featuresDetailData = {
    title: "Built for the Construction Site",
    subtitle: "Features designed specifically for field teams and harsh environments",
    workflows: [
      {
        id: 'feature-1',
        title: "Offline Mode for Remote Sites",
        description: "Work anywhere without internet connectivity. All data syncs automatically when connection is restored—no data loss, ever.",
        icon: "📡",
        steps: [
          "Fill out forms completely offline",
          "Capture photos and GPS without internet",
          "Automatic sync when online",
          "Perfect for remote locations"
        ]
      },
      {
        id: 'feature-2',
        title: "Photo Documentation with GPS",
        description: "Every photo is automatically tagged with GPS coordinates, timestamp, and linked to the specific form or inspection.",
        icon: "📷",
        steps: [
          "Auto-capture GPS location",
          "Timestamp verification",
          "Annotate photos on-site",
          "Organized by project/task"
        ]
      },
      {
        id: 'feature-3',
        title: "Geofencing & Attendance",
        description: "Automate worker check-in and check-out based on their physical location. Ensure workers are on the right site at the right time.",
        icon: "📍",
        steps: [
          "Automatic site check-in/out",
          "Geofence-based alerts",
          "Accurate time tracking",
          "Prevent time theft"
        ]
      }
    ]
  };

  const caseStudyData = {
    title: "Real Results from Construction Teams",
    subtitle: "What our clients say",
    caseStudies: [
      {
        id: 'case-1',
        title: "Commercial Construction Success",
        company: "Commercial Construction Company",
        industry: "Construction",
        challenge: "Managing 12 active construction sites with paper-based processes",
        solution: "Digital inspections with photo proof and GPS tracking",
        results: [
          "60% reduction in admin time",
          "90% compliance rate achieved",
          "$50K saved annually"
        ],
        quote: "IVAFlow transformed how we manage our 12 active construction sites. Digital inspections with photo proof eliminated disputes, and GPS tracking cut our admin time by 60%. It just works.",
        author: "Project Manager",
        authorRole: "Manager",
        metrics: [
          {
            value: "60%",
            label: "Less Admin Time"
          },
          {
            value: "90%",
            label: "Compliance Rate"
          },
          {
            value: "$50K",
            label: "Saved Annually"
          }
        ]
      }
    ]
  };

  const ctaData = {
    title: "Ready to Digitize Your Construction Operations?",
    description: "Join construction companies who've already automated their field operations with IVAFlow.",
    primaryButton: {
      text: "Start Free Trial",
      link: "/contact"
    },
    secondaryButton: {
      text: "Schedule Demo", 
      link: "/contact"
    }
  };

  return (
    <main className="min-h-screen">
      <HeroSection section={heroSection} />
      <StatsSection section={{ data: heroStatsData, style: { backgroundColor: 'bg-orange-50', textColor: 'text-slate-900', padding: 'py-12' } }} />
      <FeatureGridSection data={challengesData} style={{ columns: 2, iconSize: 'lg', showBackground: true }} />
      <WorkflowSection data={solutionsData} style={{ backgroundColor: 'bg-slate-50', textColor: 'text-slate-900', padding: 'py-16', alignment: 'center' }} />
      <WorkflowSection data={featuresDetailData} style={{ backgroundColor: 'bg-orange-50', textColor: 'text-slate-900', padding: 'py-16', alignment: 'center' }} />
      <CaseStudySection data={caseStudyData} style={{ layout: 'grid' }} />
      <CTASection data={ctaData} style={{ variant: 'gradient', alignment: 'center', size: 'lg' }} />
    </main>
  );
}
