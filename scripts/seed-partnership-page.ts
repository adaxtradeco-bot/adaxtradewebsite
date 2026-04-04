import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Partnership page...');

  const page = await prisma.page.create({
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
          props: {
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
          props: {
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
        },
        {
          id: 'types-1',
          type: 'CardsSection',
          order: 2,
          props: {
            badge: 'Partner Types',
            title: 'Choose Your Partnership Path',
            subtitle: 'Flexible models that match your business goals.',
            cards: [
              {
                icon: '🔧',
                title: 'Implementation Partner',
                description: 'Deploy and customize IVAFlow for clients. Ideal for IT consultancies & SIs.',
                features: ['Project-based revenue', 'Technical training', 'Best practices', 'Demo access', 'Pre-sales support'],
                cta: { text: 'Learn More →', href: '#apply' }
              },
              {
                icon: '💼',
                title: 'Reseller Partner',
                description: 'Sell IVAFlow directly; earn competitive margins. For VARs & solution providers.',
                features: ['Reseller discounts', 'Deal protection', 'Sales enablement', 'Co-selling', 'MDF funds'],
                cta: { text: 'Learn More →', href: '#apply' }
              },
              {
                icon: '🌐',
                title: 'Technology Partner',
                description: 'Integrate with IVAFlow and co-innovate. For software vendors & IoT providers.',
                features: ['API/integration support', 'Joint GTM', 'Co-innovation', 'Tech benefits', 'Marketplace listing'],
                cta: { text: 'Learn More →', href: '#apply' }
              }
            ]
          }
        },
        {
          id: 'requirements-1',
          type: 'TwoColumnSection',
          order: 3,
          props: {
            title: 'Ready to Get Started?',
            subtitle: 'Here is what we look for in potential partners:',
            items: [
              'Track record in automation/IT consulting',
              'Commitment to customer success',
              'Technical expertise or certification path',
              'Active sales/marketing capability',
              'Alignment with IVAFlow vision'
            ],
            image: '🤝',
            imagePosition: 'right'
          }
        },
        {
          id: 'cta-1',
          type: 'CTASection',
          order: 4,
          props: {
            title: 'Ready to Become a Partner?',
            subtitle: 'Submit your application—our team will reach out within 48 hours to discuss next steps.',
            primaryCTA: { text: 'Apply Now →', href: '/partners/apply' },
            secondaryCTA: { text: 'Contact Partners Team', href: '/partners/contact' },
            gradient: 'from-blue-600 to-teal-500'
          }
        }
      ] })
    }
  });

  console.log('✅ Partnership page created:', page.slug);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
