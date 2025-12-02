import { Metadata } from 'next';
import FormBuilderHeroSection from '@/components/builder-sections/FormBuilderHeroSection';
import FeatureCardsSection from '@/components/builder-sections/FeatureCardsSection';
import MetricsSection from '@/components/builder-sections/MetricsSection';
import TestimonialsSection from '@/components/builder-sections/TestimonialsSection';
import { FeaturesGrid } from '@/components/form-builder/FeaturesGrid';
import { TemplatesCarousel } from '@/components/form-builder/TemplatesCarousel';
import { CTASection } from '@/components/form-builder/CTASection';

export const metadata: Metadata = {
  title: 'Form Builder - IVAFlow',
  description: 'Design forms that run your processes with no-code AI-assisted builder',
};

export default function FormBuilderDynamicPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <FormBuilderHeroSection
        badge="Collect form data seamlessly. Gain real-time visibility."
        title="Design Forms that"
        titleHighlight="Run Your Processes"
        description="Build multi-step, responsive forms with AI assistance, dynamic logic, and deep integrations. Validate at the source, automate downstream, and keep a complete audit trail."
        primaryButton={{
          text: 'Open the Designer',
          href: '#demo'
        }}
        secondaryButton={{
          text: 'Browse Templates',
          href: '#templates'
        }}
        badges={['No-Code', 'AI-Assisted', 'Enterprise']}
        mediaType="placeholder"
        canvasIcon="🎨"
        canvasLabel="Form Canvas | Fields | Rules | Preview"
        features={[
          { icon: '🧩', label: 'Drag & Drop' },
          { icon: '✅', label: 'Validations' },
          { icon: '🔗', label: 'Integrations' }
        ]}
      />

      <div className="h-px bg-gradient-to-r from-transparent via-slate-900/20 dark:via-white/20 to-transparent" />

      {/* Why Enterprise Form Builder */}
      <FeaturesGrid glassEffect={false} />

      {/* Templates Carousel */}
      <TemplatesCarousel glassEffect={true} />

      {/* Core Capabilities */}
      <section id="features" className="py-20 px-6 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-600 dark:text-fuchsia-400 rounded-full font-bold text-sm uppercase tracking-wide mb-4">
              Core Capabilities
            </span>
            <h2 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">Everything You Need to Build Forms</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              From simple contact forms to complex multi-step workflows with validations and integrations
            </p>
          </div>

          <FeatureCardsSection
            data={{
              cards: [
                {
                  icon: 'FileText',
                  title: 'Multi-Step Forms',
                  description: 'Create complex forms with multiple steps',
                  details: ['Progress indicators', 'Conditional steps', 'Save & resume']
                },
                {
                  icon: 'Zap',
                  title: 'Dynamic Logic',
                  description: 'Show/hide fields based on conditions',
                  details: ['Conditional fields', 'Calculated values', 'Smart defaults']
                },
                {
                  icon: 'Shield',
                  title: 'Validations',
                  description: 'Ensure data quality at the source',
                  details: ['Built-in rules', 'Custom validators', 'Real-time feedback']
                },
                {
                  icon: 'Link',
                  title: 'Integrations',
                  description: 'Connect to your systems',
                  details: ['REST APIs', 'Webhooks', 'Pre-built connectors']
                },
                {
                  icon: 'Users',
                  title: 'Approvals',
                  description: 'Multi-level approval workflows',
                  details: ['Sequential approvals', 'Parallel reviews', 'Audit trails']
                },
                {
                  icon: 'BarChart3',
                  title: 'Analytics',
                  description: 'Track form performance',
                  details: ['Submission rates', 'Drop-off analysis', 'Custom reports']
                }
              ]
            }}
          />
        </div>
      </section>

      {/* Use Cases with Glass Effect */}
      <section className="py-20 px-6 bg-gradient-to-br from-fuchsia-50/80 via-white to-pink-50/50 dark:bg-gradient-to-b dark:from-fuchsia-500/5 dark:to-transparent relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(236,72,153,0.08)_1px,transparent_0)] dark:bg-none" style={{backgroundSize: '20px 20px'}} />
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-full font-bold text-sm uppercase tracking-wide mb-4">
              Use Cases
            </span>
            <h2 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">Built for Every Department</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              From HR onboarding to customer feedback, build any form your team needs
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-6">
            {[
              { icon: '👥', title: 'HR Forms', desc: 'Onboarding, leave requests, surveys' },
              { icon: '💰', title: 'Finance', desc: 'Expense claims, purchase orders' },
              { icon: '🎫', title: 'Support', desc: 'Ticket intake, feedback forms' },
              { icon: '📊', title: 'Sales', desc: 'Lead capture, quote requests' },
              { icon: '🔧', title: 'Operations', desc: 'Maintenance, inspections, audits' }
            ].map((useCase, idx) => (
              <div 
                key={idx} 
                className="bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-xl p-6 hover:shadow-lg transition-all hover:scale-105"
              >
                <div className="text-4xl mb-3">{useCase.icon}</div>
                <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white">{useCase.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{useCase.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Business Impact */}
      <MetricsSection
        title="Proven Business Impact"
        description="Reduce errors, accelerate processes, and improve data quality across the organization."
        metrics={[
          { value: '60%+', label: 'Faster form creation' },
          { value: '99%', label: 'Data accuracy' },
          { value: '10×', label: 'Faster integrations' },
          { value: '24/7', label: 'Automated workflows' }
        ]}
      />

      {/* Testimonials */}
      <TestimonialsSection
        data={{
          title: 'Trusted by Teams Worldwide',
          subtitle: 'Customer Stories',
          testimonials: [
            {
              name: 'Jennifer Martinez',
              role: 'HR Director, Tech Corp',
              content: 'We replaced 20+ paper forms with digital workflows in just 2 weeks. The approval automation alone saved us 15 hours per week.',
              rating: 5,
              avatar: '👩'
            },
            {
              name: 'David Kim',
              role: 'Operations Manager, Manufacturing Inc',
              content: 'The conditional logic and validations ensure we collect the right data every time. No more back-and-forth emails.',
              rating: 5,
              avatar: '👨'
            },
            {
              name: 'Lisa Anderson',
              role: 'IT Lead, Finance Co',
              content: 'Integration with our CRM and ERP was seamless. Forms now feed directly into our systems with zero manual entry.',
              rating: 5,
              avatar: '👩💼'
            }
          ]
        }}
        style={{
          backgroundColor: 'bg-white dark:bg-slate-900',
          textColor: 'text-slate-900 dark:text-white',
          padding: 'py-20',
          alignment: 'center'
        }}
      />

      {/* FAQ & CTA */}
      <CTASection glassEffect={true} />

      {/* Final CTA */}
      <section className="py-20 px-6 bg-gradient-to-r from-fuchsia-600 to-pink-500 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Build Your First Form?</h2>
          <p className="text-xl mb-8 opacity-90">
            Start with a template or build from scratch. No credit card required.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a href="/signup" className="px-8 py-4 bg-white text-fuchsia-600 rounded-full font-bold hover:bg-slate-100 transition-all hover:scale-105 shadow-2xl">
              Start Free Trial →
            </a>
            <a href="/contact-sales" className="px-8 py-4 border-2 border-white text-white rounded-full font-bold hover:bg-white/10 transition-all">
              Talk to Sales
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
