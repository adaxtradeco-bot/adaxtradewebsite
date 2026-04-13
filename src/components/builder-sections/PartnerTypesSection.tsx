'use client';

interface PartnerType {
  icon: string;
  title: string;
  description: string;
  features: string[];
  cta: {
    text: string;
    href: string;
  };
}

interface PartnerTypesSectionProps {
  data: {
    badge?: string;
    title: string;
    subtitle?: string;
    types: PartnerType[];
  };
  style?: {
    backgroundColor?: string;
    padding?: string;
  };
}

export default function PartnerTypesSection({ data, style }: PartnerTypesSectionProps) {
  return (
    <section className={`${style?.padding || 'py-16 px-6'} ${style?.backgroundColor || 'bg-slate-50 dark:bg-slate-800'}`}>
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

        {data.types.length > 0 && (
          <div className="grid md:grid-cols-3 gap-6">
            {data.types.map((type, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg"
              >
                <div className="flex items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-700 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-3xl">
                    {type.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{type.title}</h3>
                </div>
                <p className="text-slate-600 dark:text-slate-400 mb-4">{type.description}</p>
                {type.features.length > 0 && (
                  <ul className="space-y-3 mb-6">
                    {type.features.map((feature, i) => (
                      <li key={i} className="text-sm py-2 border-b border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}
                <a
                  href={type.cta.href}
                  className="block w-full text-center px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 rounded-full font-bold hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-lg hover:shadow-xl"
                >
                  {type.cta.text}
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
