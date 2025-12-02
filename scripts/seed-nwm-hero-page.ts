import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const heroSlides = [
  {
    id: 0,
    label: "Citizen Requests",
    title: "Modern public services without the legacy mess.",
    desc: "Design and launch end-to-end citizen request and ticketing systems in days, not months – fully automated, fully auditable.",
    badge: "Government / Public Sector",
    mediaType: "video",
    mediaSrc: "/media/hero-citizen.mp4",
    mediaPoster: "/media/hero-citizen-poster.jpg"
  },
  {
    id: 1,
    label: "HR & People Ops",
    title: "HR operations that feel consumer-grade.",
    desc: "From onboarding to leave management and performance reviews – unify your HR services in one no-code operating system.",
    badge: "HR & Internal Services",
    mediaType: "image",
    mediaSrc: "/media/hero-hr.jpg"
  },
  {
    id: 2,
    label: "Customer Service",
    title: "Omni-channel support, one unified OS.",
    desc: "Bring web, call center, SMS, WhatsApp and email into a single automation layer with SLAs and real-time dashboards.",
    badge: "Customer Experience",
    mediaType: "video",
    mediaSrc: "/media/hero-support.mp4",
    mediaPoster: "/media/hero-support-poster.jpg"
  },
  {
    id: 3,
    label: "Enterprise Automation",
    title: "The backbone for complex, mission-critical operations.",
    desc: "Model processes, orchestrate APIs, track SLAs and monitor everything live – all without writing a single line of code.",
    badge: "Enterprise & Operations",
    mediaType: "image",
    mediaSrc: "/media/hero-enterprise.jpg"
  }
];

async function main() {
  console.log('🚀 Creating NWMFlow Hero page with all 4 slides...');

  // Delete existing NWMFlow page if exists
  await prisma.page.deleteMany({
    where: { slug: 'nwmflow' }
  });

  const sections = JSON.stringify([
    {
      id: '1',
      type: 'HeroSliderNWMSection',
      order: 0,
      data: {
        slides: heroSlides,
        autoPlayInterval: 7000
      }
    }
  ]);

  // Create page with HeroSliderNWMSection
  const page = await prisma.page.create({
    data: {
      title: 'NWMFlow - Complete Hero',
      slug: 'nwmflow',
      language: 'en',
      status: 'published',
      isHomepage: false,
      sections: sections
    }
  });

  console.log('✅ Page created:', page.slug);
  console.log('📍 Visit: http://localhost:3000/en/nwmflow');
  console.log('✨ All 4 hero slides are now available!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
