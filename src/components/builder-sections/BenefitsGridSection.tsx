'use client';

interface Benefit {
  icon: string;
  title: string;
  description: string;
  list: string[];
}

interface BenefitsGridSectionProps {
  data: {
    badge?: string;
    title: string;
    subtitle?: string;
    features: Benefit[];
  };
  style?: {
    backgroundColor?: string;
    padding?: string;
  };
}

export default function BenefitsGridSection({ data, style }: BenefitsGridSectionProps) {
  return (
    <section className={`${style?.padding || 'py-16 px-6'} ${style?.backgroundColor || 'bg-slate-50 dark:bg-slate-900'}`}>
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
          {data.features.map((benefit, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-4">{benefit.icon}</div>
              <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">{benefit.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">{benefit.description}</p>
              <ul className="space-y-2">
                {benefit.list.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                    {item}
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
