import HeroSliderNWMSection from '@/components/builder-sections/HeroSliderNWMSection';

const heroSlides = [
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

export default function TestHeroPage() {
  return (
    <div>
      <HeroSliderNWMSection 
        slides={heroSlides}
        autoPlayInterval={7000}
      />
      
      <div className="p-8 text-center bg-white dark:bg-slate-900">
        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Test Page - All 4 Slides</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Total slides: {heroSlides.length}
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          {heroSlides.map((slide, idx) => (
            <div key={idx} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded text-slate-900 dark:text-white">
              {idx + 1}. {slide.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
