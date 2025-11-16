import { Metadata } from 'next';

import { HeroSection } from '@/components/builder-sections/HeroSection';
import FeatureGridSection from '@/components/builder-sections/FeatureGridSection';
import WorkflowSection from '@/components/builder-sections/WorkflowSection';
import CTASection from '@/components/builder-sections/CTASection';

export const metadata: Metadata = {
  title: 'Healthcare Solutions - IVAFlow',
  description: 'HIPAA-compliant automation for patient intake, appointment scheduling, equipment tracking, and compliance documentation.',
};

interface PageProps {
  params: { lang: string };
}

export default function HealthcarePage({ params }: PageProps) {

  const heroSection = {
    id: 'hero-healthcare',
    type: 'hero' as const,
    order: 0,
    data: {
      title: "Healthcare Workflow Automation",
      subtitle: "HIPAA-compliant automation for patient intake, appointment scheduling, equipment tracking, and compliance documentation.",
      description: "Transform your healthcare operations with secure, compliant workflows that improve patient experience and operational efficiency.",
      buttons: [
        {
          text: "Get Started",
          href: "/contact",
          variant: 'primary' as const,
          size: 'lg' as const
        },
        {
          text: "Request Demo",
          href: "/contact",
          variant: 'secondary' as const,
          size: 'lg' as const
        }
      ],
      badges: [
        { text: "🔒 HIPAA Compliant", variant: 'success' as const },
        { text: "✓ SOC 2 Certified", variant: 'info' as const },
        { text: "📋 Audit Ready", variant: 'default' as const }
      ]
    },
    style: {
      backgroundColor: 'bg-gradient-to-br from-cyan-900 via-blue-900 to-slate-900',
      textColor: 'text-white',
      padding: 'py-20',
      alignment: 'center' as const
    }
  };

  const challengesData = {
    title: "Healthcare Challenges We Solve",
    subtitle: "Problems We Solve for Healthcare",
    features: [
      {
        id: 'challenge-1',
        icon: "📋",
        title: "Manual Patient Intake",
        description: "Paper forms, duplicate data entry, and errors slow down patient onboarding and waste staff time.",
        color: 'red'
      },
      {
        id: 'challenge-2',
        icon: "📅", 
        title: "Appointment Management",
        description: "Scheduling conflicts, no-shows, and manual reminders create inefficiency and lost revenue.",
        color: 'orange'
      },
      {
        id: 'challenge-3',
        icon: "🔒",
        title: "Compliance Complexity", 
        description: "HIPAA regulations, documentation requirements, and audit trails are difficult to maintain manually.",
        color: 'yellow'
      },
      {
        id: 'challenge-4',
        icon: "🔧",
        title: "Equipment Tracking",
        description: "Medical equipment maintenance, calibration schedules, and usage logs are hard to track and report.",
        color: 'blue'
      }
    ]
  };

  const workflowData = {
    title: "Digital Solutions for Patient Care",
    subtitle: "HIPAA-compliant workflows that improve patient experience and operational efficiency",
    workflows: [
      {
        id: 'workflow-1',
        title: "Patient Intake & Registration",
        description: "Digital forms for patient information, insurance details, and medical history with e-signature support.",
        icon: "👤",
        steps: [
          "HIPAA-compliant forms",
          "Insurance verification",
          "E-signature capture",
          "Auto-populate from records"
        ]
      },
      {
        id: 'workflow-2',
        title: "Appointment Scheduling",
        description: "Automated scheduling, reminders, and rescheduling workflows that reduce no-shows.",
        icon: "📅",
        steps: [
          "Online booking portal",
          "SMS & email reminders",
          "Calendar integration",
          "Waitlist management"
        ]
      },
      {
        id: 'workflow-3',
        title: "Equipment Management",
        description: "Track medical equipment maintenance, calibration, and usage with automated reminders.",
        icon: "🔧",
        steps: [
          "Maintenance scheduling",
          "Calibration tracking",
          "Usage logs",
          "Service history"
        ]
      },
      {
        id: 'workflow-4',
        title: "Compliance Documentation",
        description: "Automated workflows for regulatory compliance, audits, and documentation requirements.",
        icon: "📋",
        steps: [
          "Audit trail logging",
          "Compliance checklists",
          "Document versioning",
          "Access control"
        ]
      },
      {
        id: 'workflow-5',
        title: "Staff Scheduling",
        description: "Manage shifts, certifications, and availability with automated scheduling workflows.",
        icon: "👥",
        steps: [
          "Shift management",
          "Certification tracking",
          "Time-off requests",
          "Coverage alerts"
        ]
      },
      {
        id: 'workflow-6',
        title: "Incident Reporting",
        description: "Document and track incidents, near-misses, and safety events with automatic routing.",
        icon: "⚠️",
        steps: [
          "Incident documentation",
          "Automatic routing",
          "Investigation workflows",
          "Trend analysis"
        ]
      }
    ]
  };

  const complianceData = {
    title: "Enterprise-Grade Security & Compliance",
    description: "Your patient data is protected with bank-level encryption and comprehensive compliance certifications.",
    badges: [
      {
        icon: "🔒",
        title: "HIPAA Compliant"
      },
      {
        icon: "✓",
        title: "SOC 2 Type II"
      },
      {
        icon: "🛡️",
        title: "ISO 27001"
      },
      {
        icon: "🔐",
        title: "AES-256 Encryption"
      }
    ],
    backgroundGradient: "from-cyan-600 to-blue-600"
  };

  const testimonialData = {
    title: "Real Results from Healthcare Organizations",
    subtitle: "What our clients say",
    testimonials: [
      {
        id: 'testimonial-1',
        name: "Operations Director",
        role: "Director",
        company: "Multi-Specialty Clinic",
        content: "IVAFlow streamlined our patient intake process and reduced wait times by 45%. The HIPAA-compliant workflows give us peace of mind, and our staff loves how easy it is to use.",
        rating: 5,
        avatar: "👩‍⚕️",
        results: [
          {
            metric: "45%",
            description: "Reduced Wait Times"
          },
          {
            metric: "30%", 
            description: "Fewer No-Shows"
          },
          {
            metric: "100%",
            description: "HIPAA Compliant"
          }
        ]
      }
    ]
  };

  const ctaData = {
    title: "Ready to Transform Your Healthcare Operations?",
    description: "Join healthcare organizations improving patient care with IVAFlow's HIPAA-compliant automation.",
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
      <FeatureGridSection data={challengesData} style={{ columns: 2, iconSize: 'lg', showBackground: true }} />
      <WorkflowSection data={workflowData} style={{ backgroundColor: 'bg-slate-50', textColor: 'text-slate-900', padding: 'py-16', alignment: 'center' }} />
      <CTASection data={ctaData} style={{ variant: 'gradient', alignment: 'center', size: 'lg' }} />
    </main>
  );
}