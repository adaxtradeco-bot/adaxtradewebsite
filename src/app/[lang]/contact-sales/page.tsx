import { Metadata } from 'next';
import { ContactFormSection } from '@/components/builder-sections/ContactFormSection';
import { TrustedBySection } from '@/components/builder-sections/TrustedBySection';
import { FAQAccordionSection } from '@/components/builder-sections/FAQAccordionSection';

export const metadata: Metadata = {
  title: 'Contact Sales - IVAFlow',
  description: 'Get in touch with our sales team to learn how IVAFlow can transform your business',
};

export default function ContactSalesPage() {
  return (
    <div className="min-h-screen">
      {/* Hero CTA */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-500 text-white pt-32 pb-20 px-6">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full font-bold text-sm uppercase tracking-wide mb-6 animate-fade-in">
            Let's Talk
          </span>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight animate-slide-up">
            Ready to Transform Your Business?
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto animate-slide-up animation-delay-100">
            Connect with our sales team to discover how IVAFlow's AI-native automation platform can help you build powerful applications without code.
          </p>
          <div className="flex gap-4 justify-center flex-wrap animate-slide-up animation-delay-200">
            <a href="#contact" className="px-8 py-4 bg-white text-blue-600 rounded-full font-bold hover:bg-slate-100 transition-all hover:scale-105 shadow-2xl">
              Get Started →
            </a>
            <a href="#faq" className="px-8 py-4 border-2 border-white text-white rounded-full font-bold hover:bg-white/10 transition-all">
              View FAQ
            </a>
          </div>
        </div>
      </section>

      {/* Trusted By */}
      <TrustedBySection
        data={{
          title: 'Trusted by Industry Leaders',
          subtitle: 'Join 10,000+ companies worldwide',
          logos: [
            { name: 'Tech Corp', icon: '🏢' },
            { name: 'Global Industries', icon: '🌐' },
            { name: 'Innovation Labs', icon: '🔬' },
            { name: 'Future Systems', icon: '🚀' },
            { name: 'Digital Solutions', icon: '💻' },
            { name: 'Smart Enterprises', icon: '🏭' }
          ],
          stats: [
            { value: '10K+', label: 'Active Users' },
            { value: '50M+', label: 'Forms Processed' },
            { value: '99.9%', label: 'Uptime SLA' },
            { value: '24/7', label: 'Support' }
          ]
        }}
      />

      {/* Contact Form */}
      <div id="contact">
        <ContactFormSection
          data={{
            title: 'Get in Touch with Our Sales Team',
            subtitle: 'Contact Sales',
            description: 'Fill out the form below and our team will get back to you within 24 hours to discuss your needs and show you how IVAFlow can help.',
            features: [
              {
                icon: '⚡',
                title: 'Quick Response',
                description: 'Our team responds within 24 hours on business days'
              },
              {
                icon: '🎯',
                title: 'Personalized Demo',
                description: 'Get a customized demo tailored to your use case'
              },
              {
                icon: '💼',
                title: 'Enterprise Solutions',
                description: 'Scalable plans for teams of all sizes'
              },
              {
                icon: '🔒',
                title: 'Secure & Compliant',
                description: 'SOC 2, HIPAA, and GDPR compliant platform'
              }
            ]
          }}
        />
      </div>

      {/* FAQ */}
      <div id="faq">
        <FAQAccordionSection
          data={{
            title: 'Frequently Asked Questions',
            subtitle: 'Got Questions?',
            description: 'Find answers to common questions about our sales process and services.',
            faqs: [
              {
                question: 'How quickly can I get started with IVAFlow?',
                answer: 'You can start building immediately after signing up. Our intuitive drag-and-drop builder allows you to create your first form or workflow in minutes. For enterprise customers, we provide dedicated onboarding and training.'
              },
              {
                question: 'What kind of support do you offer?',
                answer: 'We offer 24/7 email support for all plans, with priority phone and chat support for enterprise customers. Our team includes technical experts who can help with implementation, integration, and best practices.'
              },
              {
                question: 'Can IVAFlow integrate with our existing systems?',
                answer: 'Yes! IVAFlow offers robust API and webhook capabilities, plus pre-built integrations with popular tools like Salesforce, Slack, Microsoft Teams, and more. Our enterprise plan includes custom integration support.'
              },
              {
                question: 'Is my data secure with IVAFlow?',
                answer: 'Absolutely. We use bank-level AES-256 encryption, are SOC 2 Type II certified, and comply with GDPR, HIPAA, and other major data protection regulations. Your data is stored in secure, redundant data centers.'
              },
              {
                question: 'What is your pricing model?',
                answer: 'We offer flexible pricing based on your needs, from small teams to large enterprises. Contact our sales team for a customized quote that fits your requirements and budget.'
              },
              {
                question: 'Do you offer a free trial?',
                answer: 'Yes! We offer a 14-day free trial with full access to all features. No credit card required. You can upgrade to a paid plan anytime during or after the trial.'
              }
            ]
          }}
        />
      </div>

      {/* Final CTA */}
      <section className="py-20 px-6 bg-gradient-to-r from-slate-900 to-blue-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to See IVAFlow in Action?</h2>
          <p className="text-xl mb-8 opacity-90">
            Schedule a personalized demo with our team today.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a href="#contact" className="px-8 py-4 bg-white text-slate-900 rounded-full font-bold hover:bg-slate-100 transition-all hover:scale-105 shadow-2xl">
              Schedule Demo →
            </a>
            <a href="/pricing" className="px-8 py-4 border-2 border-white text-white rounded-full font-bold hover:bg-white/10 transition-all">
              View Pricing
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
