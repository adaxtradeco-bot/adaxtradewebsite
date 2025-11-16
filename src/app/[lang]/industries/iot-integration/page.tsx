import { Metadata } from 'next';

import { HeroSection } from '@/components/builder-sections/HeroSection';
import FeatureGridSection from '@/components/builder-sections/FeatureGridSection';
import WorkflowSection from '@/components/builder-sections/WorkflowSection';
import StatsSection from '@/components/builder-sections/StatsSection';
import CTASection from '@/components/builder-sections/CTASection';

export const metadata: Metadata = {
  title: 'IoT Integration - IVAFlow',
  description: 'Connect the Physical & Digital World. The only BPMS built for IoT from day one.',
};

interface PageProps {
  params: { lang: string };
}

export default function IoTPage({ params }: PageProps) {

  const heroSection = {
    id: 'hero-iot',
    type: 'hero' as const,
    order: 0,
    data: {
      title: "Connect the Physical & Digital World",
      subtitle: "The only BPMS built for IoT from day one. Connect any sensor, device, or industrial equipment directly to your workflows—no middleware required.",
      description: "Transform physical events into automated digital workflows with native IoT integration.",
      buttons: [
        {
          text: "Explore IoT Solutions",
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
      ],
      badges: [
        { text: "🔗 Any IoT device triggers workflows automatically", variant: 'info' as const },
        { text: "⚙️ Industrial sensors and machinery integration", variant: 'success' as const },
        { text: "📡 Real-time data streaming and alerts", variant: 'default' as const },
        { text: "🎛️ Bi-directional device control", variant: 'warning' as const }
      ]
    },
    style: {
      backgroundColor: 'bg-gradient-to-br from-slate-900 via-cyan-900 to-teal-800',
      textColor: 'text-white',
      padding: 'py-20',
      alignment: 'center' as const
    }
  };

  const featuresData = {
    title: "Built for Industrial IoT",
    subtitle: "Native integration with sensors, devices, and industrial equipment",
    features: [
      {
        id: 'feature-1',
        icon: "📡",
        title: "Device Connectivity",
        description: "Connect any IoT device using standard protocols like MQTT, HTTP, CoAP, and WebSockets.",
        color: 'cyan'
      },
      {
        id: 'feature-2',
        icon: "⚡", 
        title: "Event-Driven Workflows",
        description: "Trigger workflows automatically when sensors detect changes or devices send data.",
        color: 'blue'
      },
      {
        id: 'feature-3',
        icon: "🎛️",
        title: "Device Control", 
        description: "Send commands back to devices to control actuators, relays, and industrial equipment.",
        color: 'teal'
      },
      {
        id: 'feature-4',
        icon: "📊",
        title: "Real-Time Monitoring",
        description: "Visualize live data streams from all connected devices in customizable dashboards.",
        color: 'green'
      },
      {
        id: 'feature-5',
        icon: "🔒",
        title: "Secure Communication",
        description: "Enterprise-grade security for all device communications with TLS encryption and authentication.",
        color: 'purple'
      },
      {
        id: 'feature-6',
        icon: "⚙️",
        title: "Edge Computing",
        description: "Process data at the edge for low-latency responses and reduced bandwidth usage.",
        color: 'orange'
      }
    ]
  };

  const devicesData = {
    title: "Connect Any IoT Device",
    subtitle: "From simple sensors to complex industrial equipment",
    features: [
      {
        id: 'device-1',
        icon: "🌡️",
        title: "Environmental Sensors",
        description: "Temperature, humidity, air quality, light, and weather sensors",
        color: 'red'
      },
      {
        id: 'device-2',
        icon: "📍", 
        title: "GPS Trackers",
        description: "Vehicle tracking, asset location, and geofencing devices",
        color: 'blue'
      },
      {
        id: 'device-3',
        icon: "🚨",
        title: "Motion & Security", 
        description: "PIR sensors, door contacts, cameras, and alarm systems",
        color: 'yellow'
      },
      {
        id: 'device-4',
        icon: "⚙️",
        title: "Industrial Equipment",
        description: "PLCs, SCADA systems, and manufacturing machinery",
        color: 'gray'
      },
      {
        id: 'device-5',
        icon: "💧",
        title: "Utility Meters",
        description: "Water, gas, electricity, and energy consumption monitors",
        color: 'cyan'
      },
      {
        id: 'device-6',
        icon: "🏥",
        title: "Medical Devices",
        description: "Patient monitors, diagnostic equipment, and health trackers",
        color: 'green'
      },
      {
        id: 'device-7',
        icon: "🚗",
        title: "Fleet Telematics",
        description: "Vehicle diagnostics, fuel sensors, and driver behavior monitors",
        color: 'purple'
      },
      {
        id: 'device-8',
        icon: "🏗️",
        title: "Construction Equipment",
        description: "Heavy machinery sensors, site monitoring, and safety systems",
        color: 'orange'
      }
    ]
  };

  const useCasesData = {
    title: "IoT Use Cases That Drive ROI",
    subtitle: "See how businesses use IVAFlow to connect devices and automate operations",
    workflows: [
      {
        id: 'usecase-1',
        title: "Predictive Maintenance",
        description: "Monitor industrial equipment health and predict failures before they happen.",
        icon: "🏭",
        steps: [
          "Vibration sensor detects anomaly",
          "Auto-create maintenance ticket",
          "Notify technician",
          "Schedule repair and order parts"
        ]
      },
      {
        id: 'usecase-2',
        title: "Cold Chain Monitoring",
        description: "Ensure product quality with continuous temperature tracking and automatic alerts.",
        icon: "🌡️",
        steps: [
          "Temperature exceeds threshold",
          "Send SMS alert",
          "Log incident",
          "Generate compliance report"
        ]
      },
      {
        id: 'usecase-3',
        title: "Fleet Management",
        description: "Track vehicles in real-time and optimize routes based on live telematics data.",
        icon: "🚗",
        steps: [
          "Vehicle enters geofence",
          "Auto check-in driver",
          "Track fuel consumption",
          "Optimize routes automatically"
        ]
      },
      {
        id: 'usecase-4',
        title: "Smart Building Automation",
        description: "Control HVAC, lighting, and security systems based on occupancy and conditions.",
        icon: "🏢",
        steps: [
          "Motion sensor detects presence",
          "Adjust lighting & AC",
          "Log energy usage",
          "Generate savings report"
        ]
      },
      {
        id: 'usecase-5',
        title: "Safety & Compliance",
        description: "Monitor environmental conditions and ensure regulatory compliance automatically.",
        icon: "⚠️",
        steps: [
          "Gas sensor detects leak",
          "Trigger alarm and evacuate",
          "Notify emergency team",
          "Create incident report"
        ]
      },
      {
        id: 'usecase-6',
        title: "Utility Management",
        description: "Track water, gas, and electricity consumption with automated meter reading.",
        icon: "💧",
        steps: [
          "Smart meter sends reading",
          "Calculate usage and detect anomalies",
          "Alert on leaks",
          "Generate billing data"
        ]
      }
    ]
  };

  const statsData = {
    title: "Proven Results with IoT Integration",
    subtitle: "Real metrics from organizations using IVAFlow IoT",
    stats: [
      {
        value: 85,
        suffix: '%',
        label: 'Reduction in Equipment Downtime',
        icon: '📉',
        color: 'green'
      },
      {
        value: 40,
        suffix: '%',
        label: 'Energy Cost Savings',
        icon: '💡',
        color: 'cyan'
      },
      {
        value: 100,
        suffix: '%',
        label: 'Real-time Device Monitoring',
        icon: '📊',
        color: 'violet'
      }
    ]
  };

  const ctaData = {
    title: "Ready to Connect Your Devices?",
    description: "Start integrating IoT devices into your workflows today. No hardware expertise required.",
    primaryButton: {
      text: "Start Free Trial",
      link: "/contact"
    },
    secondaryButton: {
      text: "Talk to IoT Expert", 
      link: "/contact"
    }
  };

  return (
    <main className="min-h-screen">
      <HeroSection section={heroSection} />
      <FeatureGridSection data={featuresData} style={{ columns: 3, iconSize: 'lg', showBackground: true }} />
      <FeatureGridSection data={devicesData} style={{ columns: 4, iconSize: 'md', showBackground: false }} />
      <WorkflowSection data={useCasesData} style={{ backgroundColor: 'bg-slate-50', textColor: 'text-slate-900', padding: 'py-16', alignment: 'center' }} />
      <StatsSection section={{ data: statsData, style: { backgroundColor: 'bg-slate-100', textColor: 'text-slate-900', padding: 'py-16' } }} />
      <CTASection data={ctaData} style={{ variant: 'gradient', alignment: 'center', size: 'lg' }} />
    </main>
  );
}
