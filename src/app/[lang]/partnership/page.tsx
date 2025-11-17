import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Partner Program - IVAFlow',
  description: 'Join the IVAFlow partner ecosystem and grow with AI-native no-code automation',
};

export default function PartnershipPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Grow Your Business with IVAFlow
          </h1>
          <p className="text-xl text-slate-200 mb-8 max-w-3xl mx-auto">
            Join our partner ecosystem and deliver powerful automation solutions while unlocking predictable, recurring revenue.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a href="#apply" className="px-8 py-4 bg-white text-slate-900 rounded-full font-bold hover:bg-slate-100 transition-colors">
              Apply Now →
            </a>
            <a href="#contact" className="px-8 py-4 border-2 border-white text-white rounded-full font-bold hover:bg-white/10 transition-colors">
              Contact Partners Team
            </a>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-6 bg-slate-50 dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full font-bold text-sm uppercase tracking-wide mb-4">
              Partner Benefits
            </span>
            <h2 className="text-4xl font-bold mb-4">Why Partner with IVAFlow?</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Access exclusive benefits, enablement, and support to accelerate your growth.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: '💰',
                title: 'Revenue Growth',
                description: 'Unlock new revenue streams and expand your service offerings.',
                features: ['Competitive margins', 'Recurring revenue', 'Upsell & cross-sell', 'Deal registration']
              },
              {
                icon: '🎓',
                title: 'Training & Certification',
                description: 'Get your team certified and deliver world-class solutions.',
                features: ['Partner training', 'Tech certifications', 'Sales enablement', 'Live webinars']
              },
              {
                icon: '🤝',
                title: 'Dedicated Support',
                description: 'Work directly with our team for joint success.',
                features: ['Partner manager', 'Priority support', 'Pre-sales help', 'Co-marketing']
              },
              {
                icon: '🛠️',
                title: 'Partner Resources',
                description: 'Tools and templates to streamline delivery.',
                features: ['White-label options', 'Demo environments', 'Sales & marketing kits', 'Implementation packs']
              },
              {
                icon: '📈',
                title: 'Market Expansion',
                description: 'Reach new geographies & industries.',
                features: ['Co-marketing campaigns', 'Lead sharing', 'Directory listing', 'Success stories']
              },
              {
                icon: '🏆',
                title: 'Competitive Advantage',
                description: 'Stand out with an AI-native, IoT-capable platform.',
                features: ['Exclusive benefits', 'Early feature access', 'Roadmap input', 'Partner advisory board']
              }
            ].map((benefit, idx) => (
              <div key={idx} className="bg-white dark:bg-neutral-800 rounded-2xl p-6 border border-slate-200 dark:border-neutral-700 shadow-sm hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">{benefit.description}</p>
                <ul className="space-y-2">
                  {benefit.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Types */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-full font-bold text-sm uppercase tracking-wide mb-4">
              Partner Types
            </span>
            <h2 className="text-4xl font-bold mb-4">Choose Your Partnership Path</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Flexible models that match your business goals.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: '🔧',
                title: 'Implementation Partner',
                description: 'Deploy and customize IVAFlow for clients. Ideal for IT consultancies & SIs.',
                features: ['Project-based revenue', 'Technical training', 'Best practices', 'Demo access', 'Pre-sales support']
              },
              {
                icon: '💼',
                title: 'Reseller Partner',
                description: 'Sell IVAFlow directly; earn competitive margins. For VARs & solution providers.',
                features: ['Reseller discounts', 'Deal protection', 'Sales enablement', 'Co-selling', 'MDF funds']
              },
              {
                icon: '🌐',
                title: 'Technology Partner',
                description: 'Integrate with IVAFlow and co-innovate. For software vendors & IoT providers.',
                features: ['API/integration support', 'Joint GTM', 'Co-innovation', 'Tech benefits', 'Marketplace listing']
              }
            ].map((type, idx) => (
              <div key={idx} className="bg-white dark:bg-neutral-800 rounded-2xl p-6 border border-slate-200 dark:border-neutral-700 shadow-sm">
                <div className="flex items-center gap-4 pb-4 border-b border-slate-200 dark:border-neutral-700 mb-4">
                  <div className="text-3xl">{type.icon}</div>
                  <h3 className="text-xl font-bold">{type.title}</h3>
                </div>
                <p className="text-slate-600 dark:text-slate-400 mb-4">{type.description}</p>
                <ul className="space-y-3 mb-6">
                  {type.features.map((feature, i) => (
                    <li key={i} className="text-sm py-2 border-b border-slate-100 dark:border-neutral-700">
                      {feature}
                    </li>
                  ))}
                </ul>
                <a href="#apply" className="block w-full text-center px-6 py-3 bg-yellow-400 text-slate-900 rounded-full font-bold hover:bg-yellow-500 transition-colors">
                  Learn More →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-20 px-6 bg-slate-50 dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
                Here's what we look for in potential partners:
              </p>
              <ul className="space-y-4">
                {[
                  'Track record in automation/IT consulting',
                  'Commitment to customer success',
                  'Technical expertise or certification path',
                  'Active sales/marketing capability',
                  'Alignment with IVAFlow\'s vision'
                ].map((req, idx) => (
                  <li key={idx} className="flex items-center gap-3 py-3 border-b border-slate-200 dark:border-neutral-700">
                    <span className="text-blue-500 font-bold text-xl">→</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl min-h-[400px] flex items-center justify-center border border-slate-700 shadow-2xl">
              <div className="text-8xl filter drop-shadow-2xl">🤝</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="apply" className="py-20 px-6 bg-gradient-to-r from-blue-600 to-teal-500 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Become a Partner?</h2>
          <p className="text-xl mb-8 opacity-95">
            Submit your application—our team will reach out within 48 hours to discuss next steps.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a href="/partners/apply" className="px-8 py-4 bg-white text-slate-900 rounded-full font-bold hover:bg-slate-100 transition-colors shadow-lg">
              Apply Now →
            </a>
            <a href="/partners/contact" className="px-8 py-4 border-2 border-white text-white rounded-full font-bold hover:bg-white/10 transition-colors">
              Contact Partners Team
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
