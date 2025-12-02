'use client';

interface Feature {
  icon?: string;
  title: string;
  description: string;
}

interface FeaturesMinimalSectionProps {
  data: {
    badge?: string;
    title: string;
    subtitle?: string;
    features: Feature[];
  };
  style?: {
    backgroundColor?: string;
    padding?: string;
  };
}

export default function FeaturesMinimalSection({ data, style }: FeaturesMinimalSectionProps) {
  return (
    <section className={`${style?.padding || 'py-16 px-6'} ${style?.backgroundColor || 'bg-slate-50 dark:bg-slate-900'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          {data.badge && (
            <span className="inline-block px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full font-bold text-sm uppercase tracking-wide mb-4">
              {data.badge}
            </span>
          )}
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">{data.title}</h2>
          {data.subtitle && (
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto">
              {data.subtitle}
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.features.map((feature, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-600 transition-colors"
            >
              {feature.icon && <div className="text-2xl mb-3">{feature.icon}</div>}
              <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">{feature.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
