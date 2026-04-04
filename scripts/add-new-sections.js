const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const newSectionsData = {
  testimonial: {
    id: 'testimonial-1',
    type: 'testimonial',
    order: 1,
    data: {
      title: 'What Our Students Say',
      subtitle: 'Real feedback from real learners',
      testimonials: [
        {
          id: 't1',
          name: 'Sarah Johnson',
          role: 'Marketing Manager',
          company: 'TechCorp',
          content: 'This platform transformed my English skills in just 3 months!',
          rating: 5,
          avatar: '/assets/avatar1.jpg'
        },
        {
          id: 't2',
          name: 'Ahmed Hassan',
          role: 'Software Engineer',
          company: 'DevHub',
          content: 'The interactive lessons made learning fun and effective.',
          rating: 5,
          avatar: '/assets/avatar2.jpg'
        },
        {
          id: 't3',
          name: 'Maria Garcia',
          role: 'Business Analyst',
          company: 'DataCo',
          content: 'I can now confidently speak English in business meetings.',
          rating: 5,
          avatar: '/assets/avatar3.jpg'
        }
      ]
    },
    style: {
      layout: 'grid',
      columns: 3,
      showRating: true,
      showAvatar: true
    }
  },
  featureGrid: {
    id: 'feature-grid-1',
    type: 'feature-grid',
    order: 2,
    data: {
      title: 'Powerful Features',
      subtitle: 'Everything you need to master English',
      features: [
        {
          id: 'f1',
          icon: 'Zap',
          title: 'Fast Learning',
          description: 'Learn at your own pace with adaptive lessons',
          color: '#8B5CF6'
        },
        {
          id: 'f2',
          icon: 'Target',
          title: 'Goal Tracking',
          description: 'Set and achieve your learning goals',
          color: '#06B6D4'
        },
        {
          id: 'f3',
          icon: 'Users',
          title: 'Community',
          description: 'Connect with learners worldwide',
          color: '#10B981'
        },
        {
          id: 'f4',
          icon: 'Award',
          title: 'Certificates',
          description: 'Earn recognized certificates',
          color: '#F59E0B'
        }
      ]
    },
    style: {
      columns: 4,
      iconSize: 'md',
      showBackground: true
    }
  },
  cta: {
    id: 'cta-1',
    type: 'cta',
    order: 3,
    data: {
      title: 'Ready to Start Learning?',
      description: 'Join thousands of students improving their English every day',
      primaryButton: {
        text: 'Get Started Free',
        link: '/signup'
      },
      secondaryButton: {
        text: 'View Pricing',
        link: '/pricing'
      }
    },
    style: {
      variant: 'gradient',
      alignment: 'center',
      size: 'md'
    }
  },
  team: {
    id: 'team-1',
    type: 'team',
    order: 4,
    data: {
      title: 'Meet Our Team',
      subtitle: 'Passionate educators dedicated to your success',
      members: [
        {
          id: 'm1',
          name: 'Dr. Emily Chen',
          role: 'Lead Instructor',
          bio: 'PhD in Applied Linguistics with 15 years of teaching experience',
          avatar: '/assets/team1.jpg',
          social: {
            linkedin: 'https://linkedin.com/in/emilychen',
            twitter: 'https://twitter.com/emilychen',
            email: 'emily@example.com'
          }
        },
        {
          id: 'm2',
          name: 'John Smith',
          role: 'Curriculum Designer',
          bio: 'Expert in creating engaging learning experiences',
          avatar: '/assets/team2.jpg',
          social: {
            linkedin: 'https://linkedin.com/in/johnsmith',
            github: 'https://github.com/johnsmith'
          }
        },
        {
          id: 'm3',
          name: 'Lisa Wang',
          role: 'Student Success Manager',
          bio: 'Dedicated to helping students achieve their goals',
          avatar: '/assets/team3.jpg',
          social: {
            linkedin: 'https://linkedin.com/in/lisawang',
            email: 'lisa@example.com'
          }
        }
      ]
    },
    style: {
      columns: 3,
      showBio: true,
      showSocial: true,
      cardStyle: 'card'
    }
  },
  faq: {
    id: 'faq-1',
    type: 'faq',
    order: 5,
    data: {
      title: 'Frequently Asked Questions',
      subtitle: 'Everything you need to know about our platform',
      faqs: [
        {
          id: 'faq1',
          question: 'How long does it take to see results?',
          answer: 'Most students see noticeable improvement within 4-6 weeks of consistent practice.'
        },
        {
          id: 'faq2',
          question: 'Can I learn at my own pace?',
          answer: 'Absolutely! Our platform is designed for self-paced learning with flexible schedules.'
        },
        {
          id: 'faq3',
          question: 'Do you offer certificates?',
          answer: 'Yes, we provide certificates upon completion of each course level.'
        },
        {
          id: 'faq4',
          question: 'Is there a mobile app?',
          answer: 'Yes, our mobile app is available for both iOS and Android devices.'
        }
      ]
    },
    style: {
      layout: 'two-column',
      defaultOpen: false,
      showNumbers: true
    }
  }
};

async function main() {
  console.log('Adding new sections to database...');
  
  // Example: Create a demo page with all new sections
  const demoPage = await prisma.page.create({
    data: {
      slug: 'demo-new-sections',
      isBuilderPage: true,
      builderVersion: '1.0',
      builderData: {
        sections: Object.values(newSectionsData)
      },
      translations: {
        create: [
          {
            language: 'en',
            title: 'Demo - New Sections',
            description: 'Showcase of 5 new builder sections',
            content: {}
          },
          {
            language: 'ar',
            title: 'عرض توضيحي - أقسام جديدة',
            description: 'عرض 5 أقسام جديدة للبناء',
            content: {}
          }
        ]
      }
    }
  });

  console.log('✅ Demo page created:', demoPage.slug);
  console.log('📦 Sections included:');
  console.log('  - Testimonial Section');
  console.log('  - Feature Grid Section');
  console.log('  - CTA Section');
  console.log('  - Team Section');
  console.log('  - FAQ Section');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
