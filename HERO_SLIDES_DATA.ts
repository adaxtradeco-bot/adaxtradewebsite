// Complete Hero Slides Data from NWMFlow original site
// Use this data in your page builder or directly in components

export const heroSlidesData = [
  {
    id: 0,
    label: "Citizen Requests",
    title: "Modern public services without the legacy mess.",
    desc: "Design and launch end-to-end citizen request and ticketing systems in days, not months – fully automated, fully auditable.",
    badge: "Government / Public Sector",
    mediaType: "video" as const,
    mediaSrc: "/media/hero-citizen.mp4",
    mediaPoster: "/media/hero-citizen-poster.jpg"
  },
  {
    id: 1,
    label: "HR & People Ops",
    title: "HR operations that feel consumer-grade.",
    desc: "From onboarding to leave management and performance reviews – unify your HR services in one no-code operating system.",
    badge: "HR & Internal Services",
    mediaType: "image" as const,
    mediaSrc: "/media/hero-hr.jpg"
  },
  {
    id: 2,
    label: "Customer Service",
    title: "Omni-channel support, one unified OS.",
    desc: "Bring web, call center, SMS, WhatsApp and email into a single automation layer with SLAs and real-time dashboards.",
    badge: "Customer Experience",
    mediaType: "video" as const,
    mediaSrc: "/media/hero-support.mp4",
    mediaPoster: "/media/hero-support-poster.jpg"
  },
  {
    id: 3,
    label: "Enterprise Automation",
    title: "The backbone for complex, mission-critical operations.",
    desc: "Model processes, orchestrate APIs, track SLAs and monitor everything live – all without writing a single line of code.",
    badge: "Enterprise & Operations",
    mediaType: "image" as const,
    mediaSrc: "/media/hero-enterprise.jpg"
  }
];

// Example usage in a page:
/*
import { heroSlidesData } from '@/HERO_SLIDES_DATA';
import HeroSliderNWMSection from '@/components/builder-sections/HeroSliderNWMSection';

<HeroSliderNWMSection 
  slides={heroSlidesData}
  autoPlayInterval={7000}
/>
*/
