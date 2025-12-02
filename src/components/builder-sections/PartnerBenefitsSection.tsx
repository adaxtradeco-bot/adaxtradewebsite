'use client';

interface Benefit {
  icon: string;
  title: string;
  description: string;
  features: string[];
}

interface PartnerBenefitsSectionProps {
  data: {
    badge?: string;
    title: string;
    subtitle?: string;
    benefits: Benefit[];
  };
  style?: {
    backgroundColor?: string;
    padding?: string;
  };
}

export default function PartnerBenefitsSection({ data, style }: PartnerBenefitsSectionProps) {
  return (
    <section className={`${style?.padding || 'py-16 px-6'} ${style?.backgroundColor || 'bg-white dark:bg-slate-900'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          {data.badge && (
            <span className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full font-bold text-sm uppercase tracking-wide mb-4">
              {data.badge}
            </span>
          )}
          <h2 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">{data.title}</h2>
          {data.subtitle && (
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              {data.subtitle}
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.benefits.map((benefit, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 dark:from-teal-500 dark:to-teal-700 flex items-center justify-center text-3xl mb-4">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">{benefit.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">{benefit.description}</p>
              <ul className="space-y-2">
                {benefit.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <span className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
