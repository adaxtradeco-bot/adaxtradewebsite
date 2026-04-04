import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Deleting partnership page...');
  
  await prisma.page.deleteMany({
    where: { slug: 'partnership' }
  });

  console.log('🌱 Creating partnership page with exact styling...');

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
          type: 'hero',
          order: 0,
          data: {
            title: 'Grow Your Business with IVAFlow',
            description: 'Join our partner ecosystem and deliver powerful automation solutions while unlocking predictable, recurring revenue.',
            buttons: [
              { text: 'Apply Now →', href: '#apply', variant: 'primary' },
              { text: 'Contact Partners Team', href: '/partners#contact', variant: 'secondary' }
            ]
          },
          style: {
            backgroundColor: 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900',
            textColor: 'text-white',
            padding: 'py-24 px-6',
            alignment: 'center'
          }
        },
        {
          id: 'benefits-1',
          type: 'benefits-grid',
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
                list: ['Competitive margins', 'Recurring revenue', 'Upsell & cross-sell', 'Deal registration']
              },
              {
                icon: '🎓',
                title: 'Training & Certification',
                description: 'Get your team certified and deliver world-class solutions.',
                list: ['Partner training', 'Tech certifications', 'Sales enablement', 'Live webinars']
              },
              {
                icon: '🤝',
                title: 'Dedicated Support',
                description: 'Work directly with our team for joint success.',
                list: ['Partner manager', 'Priority support', 'Pre-sales help', 'Co-marketing']
              },
              {
                icon: '🛠️',
                title: 'Partner Resources',
                description: 'Tools and templates to streamline delivery.',
                list: ['White-label options', 'Demo environments', 'Sales & marketing kits', 'Implementation packs']
              },
              {
                icon: '📈',
                title: 'Market Expansion',
                description: 'Reach new geographies & industries.',
                list: ['Co-marketing campaigns', 'Lead sharing', 'Directory listing', 'Success stories']
              },
              {
                icon: '🏆',
                title: 'Competitive Advantage',
                description: 'Stand out with an AI-native, IoT-capable platform.',
                list: ['Exclusive benefits', 'Early feature access', 'Roadmap input', 'Partner advisory board']
              }
            ]
          },
          style: {
            backgroundColor: 'bg-slate-50 dark:bg-slate-900',
            padding: 'py-16 px-6'
          }
        },
        {
          id: 'types-1',
          type: 'partner-cards',
          order: 2,
          data: {
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
          },
          style: {
            backgroundColor: 'bg-white dark:bg-slate-800',
            padding: 'py-16 px-6'
          }
        },
        {
          id: 'requirements-1',
          type: 'two-column-media',
          order: 3,
          data: {
            title: 'Ready to Get Started?',
            subtitle: 'Here is what we look for in potential partners:',
            items: [
              'Track record in automation/IT consulting',
              'Commitment to customer success',
              'Technical expertise or certification path',
              'Active sales/marketing capability',
              'Alignment with IVAFlow vision'
            ],
            mediaType: 'emoji',
            mediaContent: '🤝',
            layout: 'text-left'
          },
          style: {
            backgroundColor: 'bg-slate-50 dark:bg-slate-900',
            padding: 'py-16 px-6'
          }
        },
        {
          id: 'cta-1',
          type: 'cta',
          order: 4,
          data: {
            title: 'Ready to Become a Partner?',
            description: 'Submit your application—our team will reach out within 48 hours to discuss next steps.',
            buttons: [
              { text: 'Apply Now →', href: '/partners/apply', variant: 'primary' },
              { text: 'Contact Partners Team', href: '/partners/contact', variant: 'secondary' }
            ]
          },
          style: {
            backgroundColor: 'bg-gradient-to-r from-blue-600 to-teal-500',
            textColor: 'text-white',
            padding: 'py-20 px-6',
            alignment: 'center'
          }
        }
      ] })
    }
  });

  console.log('✅ Partnership page created');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
