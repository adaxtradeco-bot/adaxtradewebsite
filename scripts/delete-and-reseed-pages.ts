import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Deleting old pages...');
  
  await prisma.page.deleteMany({
    where: {
      slug: {
        in: ['partnership', 'fleet-management', 'business-automation']
      }
    }
  });

  console.log('✅ Old pages deleted');
  console.log('🌱 Re-seeding pages...');

  // Partnership
  await prisma.page.create({
    data: {
      slug: 'partnership',
      title: 'Partner Program - IVAFlow',
      metaDescription: 'Join the IVAFlow partner ecosystem and grow with AI-native no-code automation',
      language: 'en',
      status: 'published',
      isBuilderPage: true,
      builderData: JSON.stringify({ sections: [
        {
          id: 'hero-1',
          type: 'HeroSection',
          order: 0,
          data: {
            title: 'Grow Your Business with IVAFlow',
            subtitle: 'Join our partner ecosystem and deliver powerful automation solutions while unlocking predictable, recurring revenue.',
            primaryCTA: { text: 'Apply Now →', href: '#apply' },
            secondaryCTA: { text: 'Contact Partners Team', href: '#contact' },
            backgroundGradient: 'from-slate-900 via-slate-800 to-slate-900'
          }
        },
        {
          id: 'benefits-1',
          type: 'FeaturesGridSection',
          order: 1,
          data: {
            badge: 'Partner Benefits',
            title: 'Why Partner with IVAFlow?',
            subtitle: 'Access exclusive benefits, enablement, and support to accelerate your growth.',
            features: [
              {
                icon: '💰',
                title: 'Revenue Growth',
                description: 'Unlock new revenue streams and expand your service offerings.',
                items: ['Competitive margins', 'Recurring revenue', 'Upsell & cross-sell', 'Deal registration']
              },
              {
                icon: '🎓',
                title: 'Training & Certification',
                description: 'Get your team certified and deliver world-class solutions.',
                items: ['Partner training', 'Tech certifications', 'Sales enablement', 'Live webinars']
              },
              {
                icon: '🤝',
                title: 'Dedicated Support',
                description: 'Work directly with our team for joint success.',
                items: ['Partner manager', 'Priority support', 'Pre-sales help', 'Co-marketing']
              },
              {
                icon: '🛠️',
                title: 'Partner Resources',
                description: 'Tools and templates to streamline delivery.',
                items: ['White-label options', 'Demo environments', 'Sales & marketing kits', 'Implementation packs']
              },
              {
                icon: '📈',
                title: 'Market Expansion',
                description: 'Reach new geographies & industries.',
                items: ['Co-marketing campaigns', 'Lead sharing', 'Directory listing', 'Success stories']
              },
              {
                icon: '🏆',
                title: 'Competitive Advantage',
                description: 'Stand out with an AI-native, IoT-capable platform.',
                items: ['Exclusive benefits', 'Early feature access', 'Roadmap input', 'Partner advisory board']
              }
            ]
          }
        }
      ] })
    }
  });

  console.log('✅ Partnership page created');

  // Fleet Management
  await prisma.page.create({
    data: {
      slug: 'fleet-management',
      title: 'Fleet Management BPMS - Modern Fleet Operations',
      metaDescription: 'Enterprise-grade platform unifying Business Process Management with AVL telematics',
      language: 'en',
      status: 'published',
      isBuilderPage: true,
      builderData: JSON.stringify({ sections: [
        {
          id: 'hero-1',
          type: 'HeroSection',
          order: 0,
          data: {
            title: 'Fleet Management BPMS',
            subtitle: 'Enterprise-grade platform unifying Business Process Management with AVL telematics',
            primaryCTA: { text: 'Get Started', href: '/contact-sales' }
          }
        }
      ] })
    }
  });

  console.log('✅ Fleet Management page created');

  // Business Automation
  await prisma.page.create({
    data: {
      slug: 'business-automation',
      title: 'Business Automation - From Idea to Impact',
      metaDescription: 'Unlock the power of no-code automation and transform your business workflows',
      language: 'en',
      status: 'published',
      isBuilderPage: true,
      builderData: JSON.stringify({ sections: [
        {
          id: 'hero-1',
          type: 'HeroSection',
          order: 0,
          data: {
            title: 'Business Automation',
            subtitle: 'Transform your workflows with no-code automation',
            primaryCTA: { text: 'Get Started', href: '/contact-sales' }
          }
        }
      ] })
    }
  });

  console.log('✅ Business Automation page created');
  console.log('🎉 All pages re-seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
