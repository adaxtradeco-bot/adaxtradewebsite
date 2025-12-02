import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Updating partnership page hero...');

  const page = await prisma.page.findFirst({
    where: { slug: 'partnership' }
  });

  if (!page) {
    console.error('❌ Partnership page not found');
    return;
  }

  const builderData = JSON.parse(page.builderData || '{"sections":[]}');
  
  // Replace first section (hero) with new partnership hero
  builderData.sections[0] = {
    id: 'hero-1',
    type: 'partnership-hero',
    order: 0,
    data: {
      title: 'Join the IVAFlow Partner Ecosystem',
      subtitle: 'Grow your business by delivering powerful automation solutions to your clients',
      intro: 'Whether you want to resell our platform, integrate it into your services, or build custom solutions, we have a partnership model designed for your success.',
      partnerTypes: [
        {
          icon: '🤝',
          title: 'Reseller Partners',
          description: 'Sell IVAFlow products and provide local support and marketing in your region. Earn competitive margins while helping businesses transform their operations.'
        },
        {
          icon: '🔗',
          title: 'Solution Partners',
          description: 'Integrate IVAFlow into your existing services and offer it as a complementary product. Enhance your value proposition and create new revenue streams.'
        },
        {
          icon: '🛠️',
          title: 'Development Partners',
          description: 'Design add-ons, templates, and custom solutions that extend IVAFlow functionality. Monetize your expertise and help clients achieve more.'
        }
      ],
      cta: {
        text: 'Start Your Partnership Today',
        href: '#apply'
      }
    }
  };

  await prisma.page.update({
    where: { id: page.id },
    data: {
      builderData: JSON.stringify(builderData)
    }
  });

  console.log('✅ Partnership hero updated successfully');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
