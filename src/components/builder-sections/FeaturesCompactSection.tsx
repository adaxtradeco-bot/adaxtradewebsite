'use client';

interface Feature {
  icon?: string;
  title: string;
  description: string;
}

interface FeaturesCompactSectionProps {
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

export default function FeaturesCompactSection({ data, style }: FeaturesCompactSectionProps) {
  return (
    <section className={`${style?.padding || 'py-16 px-6'} ${style?.backgroundColor || 'bg-gradient-to-br from-blue-50/80 via-white to-slate-50/50 dark:bg-gradient-to-b dark:from-blue-600/5 dark:to-transparent'} relative`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(59,130,246,0.08)_1px,transparent_0)] dark:bg-none pointer-events-none" style={{backgroundSize: '20px 20px'}} />
      
      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-12">
          {data.badge && (
            <span className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full font-bold text-sm uppercase tracking-wide mb-4">
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

        <div className="grid md:grid-cols-2 gap-8">
          {data.features.map((feature, idx) => (
            <div
              key={idx}
              className="bg-white/80 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-shadow backdrop-blur-sm"
            >
              <div className="flex items-start gap-4">
                {feature.icon && <div className="text-3xl flex-shrink-0">{feature.icon}</div>}
                <div>
                  <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">{feature.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
