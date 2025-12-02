import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Adding both hero versions to partnership page...');

  const page = await prisma.page.findFirst({
    where: { slug: 'partnership' }
  });

  if (!page) {
    console.error('❌ Partnership page not found');
    return;
  }

  const builderData = JSON.parse(page.builderData || '{"sections":[]}');
  
  // Add interactive hero as first section
  builderData.sections.unshift({
    id: 'hero-interactive',
    type: 'partnership-hero-interactive',
    order: 0,
    data: {
      title: 'Join the IVAFlow Partner Ecosystem',
      subtitle: 'Grow your business by delivering powerful automation solutions',
      intro: 'Choose the partnership model that fits your business goals and start earning today.',
      partnerTypes: [
        {
          icon: '🤝',
          title: 'Reseller Partners',
          description: 'Sell IVAFlow products and provide local support and marketing in your region.',
          benefits: [
            'Competitive margins up to 40%',
            'Deal registration protection',
            'Co-marketing support',
            'Sales enablement training',
            'Priority technical support'
          ],
          color: 'blue'
        },
        {
          icon: '🔗',
          title: 'Solution Partners',
          description: 'Integrate IVAFlow into your existing services and offer it as a complementary product.',
          benefits: [
            'API integration support',
            'Joint go-to-market strategy',
            'Revenue sharing model',
            'Technical documentation',
            'Co-innovation opportunities'
          ],
          color: 'teal'
        },
        {
          icon: '🛠️',
          title: 'Development Partners',
          description: 'Design add-ons, templates, and custom solutions that extend IVAFlow functionality.',
          benefits: [
            'Marketplace listing',
            'Revenue from sales',
            'Developer resources',
            'Early feature access',
            'Community recognition'
          ],
          color: 'purple'
        }
      ],
      cta: {
        text: 'Start Your Partnership Today',
        href: '#apply'
      }
    }
  });

  // Update order for existing sections
  builderData.sections = builderData.sections.map((section: any, idx: number) => ({
    ...section,
    order: idx
  }));

  await prisma.page.update({
    where: { id: page.id },
    data: {
      builderData: JSON.stringify(builderData)
    }
  });

  console.log('✅ Both hero versions added successfully');
  console.log('📝 You can now delete one from the builder');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
