import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedRealEstate() {
  const builderData = {
    sections: [
      // Hero Section
      {
        id: 'hero-1',
        type: 'hero',
        order: 0,
        data: {
          title: 'Find Your Dream Property',
          subtitle: 'Premium Real Estate Solutions',
          description: 'Discover exceptional properties with our intelligent platform. From luxury homes to commercial spaces, we make property management effortless.',
          buttons: [
            { text: 'Browse Properties', href: '#properties', variant: 'primary', size: 'lg' },
            { text: 'Schedule Tour', href: '#contact', variant: 'outline', size: 'lg' },
          ],
          badges: [
            { text: '10K+ Properties', variant: 'success' },
            { text: 'Trusted by 50K+', variant: 'info' },
          ],
        },
        style: {
          backgroundColor: 'bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50',
          textColor: 'text-slate-900',
          padding: 'py-24 lg:py-32',
          alignment: 'center',
        },
      },
      // Stats Section
      {
        id: 'stats-1',
        type: 'stats',
        order: 1,
        data: {
          title: 'Our Impact in Numbers',
          stats: [
            { value: 10000, suffix: '+', label: 'Happy Clients', icon: '👥', color: 'violet' },
            { value: 50000, suffix: '+', label: 'Properties Sold', icon: '🏠', color: 'cyan' },
            { value: 2, suffix: 'B+', label: 'Total Value', icon: '💰', color: 'green' },
            { value: 98, suffix: '%', label: 'Satisfaction Rate', icon: '⭐', color: 'orange' },
          ],
        },
        style: {
          backgroundColor: 'bg-slate-900',
          textColor: 'text-white',
          padding: 'py-16',
          alignment: 'center',
        },
      },
      // Properties Showcase
      {
        id: 'properties-1',
        type: 'properties',
        order: 2,
        data: {
          title: 'Featured Properties',
          subtitle: 'Discover your dream home from our exclusive collection',
          properties: [
            {
              title: 'Modern Downtown Apartment',
              location: 'New York, NY',
              price: '$850,000',
              beds: 3,
              baths: 2,
              sqft: '2,100',
              image: '🏢',
            },
            {
              title: 'Luxury Beach Villa',
              location: 'Miami, FL',
              price: '$2,500,000',
              beds: 5,
              baths: 4,
              sqft: '4,500',
              image: '🏖️',
            },
            {
              title: 'Suburban Family Home',
              location: 'Austin, TX',
              price: '$650,000',
              beds: 4,
              baths: 3,
              sqft: '3,200',
              image: '🏡',
            },
            {
              title: 'Penthouse Suite',
              location: 'Los Angeles, CA',
              price: '$3,200,000',
              beds: 4,
              baths: 3,
              sqft: '3,800',
              image: '🌆',
            },
            {
              title: 'Mountain Retreat',
              location: 'Denver, CO',
              price: '$1,100,000',
              beds: 4,
              baths: 3,
              sqft: '2,900',
              image: '⛰️',
            },
            {
              title: 'Waterfront Condo',
              location: 'Seattle, WA',
              price: '$950,000',
              beds: 2,
              baths: 2,
              sqft: '1,800',
              image: '🌊',
            },
          ],
        },
        style: {
          backgroundColor: 'bg-slate-50',
          textColor: 'text-slate-900',
          padding: 'py-20',
          alignment: 'center',
        },
      },
      // Features Section
      {
        id: 'features-1',
        type: 'features',
        order: 3,
        data: {
          title: 'Why Choose Us',
          subtitle: 'Everything you need for successful property management',
          description: 'Our platform provides comprehensive tools and services',
          items: [
            {
              title: 'Smart Property Search',
              description: 'AI-powered search to find properties matching your exact criteria',
              icon: '🔍',
            },
            {
              title: 'Virtual Tours',
              description: '360° virtual tours and high-quality photos for every property',
              icon: '🎥',
            },
            {
              title: 'Market Analytics',
              description: 'Real-time market data and pricing insights',
              icon: '📊',
            },
            {
              title: 'Secure Transactions',
              description: 'End-to-end encrypted and legally compliant processes',
              icon: '🔒',
            },
            {
              title: 'Expert Guidance',
              description: 'Professional agents available 24/7 for consultation',
              icon: '👨‍💼',
            },
            {
              title: 'Property Management',
              description: 'Complete management solutions for landlords and investors',
              icon: '🏗️',
            },
          ],
        },
        style: {
          backgroundColor: 'bg-white',
          textColor: 'text-slate-900',
          padding: 'py-20',
          alignment: 'center',
        },
      },
      // Testimonials Section
      {
        id: 'testimonials-1',
        type: 'testimonials',
        order: 4,
        data: {
          title: 'What Our Clients Say',
          subtitle: 'Real stories from real people',
          testimonials: [
            {
              name: 'Sarah Johnson',
              role: 'Property Investor',
              content: 'Outstanding service! They helped me find the perfect investment property. The team was professional and made the entire process seamless.',
              rating: 5,
              avatar: '👩',
            },
            {
              name: 'Michael Chen',
              role: 'First-time Buyer',
              content: 'As a first-time buyer, I was nervous about the process. The team guided me every step of the way and found me my dream home!',
              rating: 5,
              avatar: '👨',
            },
            {
              name: 'Emily Davis',
              role: 'Real Estate Developer',
              content: 'Excellent market knowledge and negotiation skills. They consistently deliver results and exceed expectations. Highly recommended!',
              rating: 5,
              avatar: '👩‍💼',
            },
            {
              name: 'James Wilson',
              role: 'Commercial Investor',
              content: 'Their commercial property expertise is unmatched. Helped me secure multiple high-value properties with excellent ROI.',
              rating: 5,
              avatar: '👨‍💼',
            },
            {
              name: 'Lisa Martinez',
              role: 'Homeowner',
              content: 'Sold my house in just 2 weeks at above asking price! Their marketing strategy and professional approach made all the difference.',
              rating: 5,
              avatar: '👩‍🦰',
            },
            {
              name: 'David Brown',
              role: 'Property Manager',
              content: 'The property management tools are incredible. Streamlined all my operations and increased tenant satisfaction significantly.',
              rating: 5,
              avatar: '👨‍🦲',
            },
          ],
        },
        style: {
          backgroundColor: 'bg-slate-50',
          textColor: 'text-slate-900',
          padding: 'py-20',
          alignment: 'center',
        },
      },
      // Location Section
      {
        id: 'location-1',
        type: 'location',
        order: 5,
        data: {
          title: 'Visit Our Office',
          subtitle: "We're here to help you find your perfect property",
          address: '123 Real Estate Boulevard, Suite 500',
          city: 'New York, NY 10001',
          phone: '+1 (555) 123-4567',
          email: 'info@realestate.com',
          hours: 'Mon-Fri: 9AM-7PM | Sat-Sun: 10AM-5PM',
        },
        style: {
          backgroundColor: 'bg-white',
          textColor: 'text-slate-900',
          padding: 'py-20',
          alignment: 'left',
        },
      },
      // CTA Section
      {
        id: 'cta-1',
        type: 'cta',
        order: 6,
        data: {
          title: 'Ready to Find Your Dream Property?',
          description: 'Join thousands of satisfied clients who found their perfect home with us. Start your journey today!',
          buttons: [
            { text: 'Get Started Now', href: '#contact', variant: 'primary', size: 'lg' },
            { text: 'Talk to an Agent', href: '#contact', variant: 'secondary', size: 'lg' },
          ],
        },
        style: {
          backgroundColor: 'bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-600',
          textColor: 'text-white',
          padding: 'py-20',
          alignment: 'center',
        },
      },
    ],
  };

  await prisma.page.upsert({
    where: { slug: 'industries-real-estate' },
    update: {
      builderData: JSON.stringify(builderData),
      isBuilderPage: true,
      status: 'published',
    },
    create: {
      title: 'Real Estate Solutions',
      slug: 'industries-real-estate',
      metaTitle: 'Real Estate Solutions - IVAFlow',
      metaDescription: 'Streamline property management and operations with intelligent automation',
      status: 'published',
      language: 'en',
      builderData: JSON.stringify(builderData),
      isBuilderPage: true,
      builderVersion: '1.0',
    },
  });

  console.log('✅ Real Estate page seeded successfully!');
}

seedRealEstate()
  .catch((e) => {
    console.error('❌ Error seeding Real Estate page:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
