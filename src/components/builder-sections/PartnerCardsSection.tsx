'use client';

interface PartnerCard {
  icon: string;
  title: string;
  description: string;
  features: string[];
  cta: {
    text: string;
    href: string;
  };
}

interface PartnerCardsSectionProps {
  data: {
    badge?: string;
    title: string;
    subtitle?: string;
    cards: PartnerCard[];
  };
  style?: {
    backgroundColor?: string;
    padding?: string;
  };
}

export default function PartnerCardsSection({ data, style }: PartnerCardsSectionProps) {
  return (
    <section className={`${style?.padding || 'py-16 px-6'} ${style?.backgroundColor || 'bg-white dark:bg-slate-800'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          {data.badge && (
            <span className="inline-block px-4 py-2 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-full font-bold text-sm uppercase tracking-wide mb-4">
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

        <div className="grid md:grid-cols-3 gap-6">
          {data.cards.map((card, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm"
            >
              <div className="flex items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-700 mb-4">
                <div className="text-3xl">{card.icon}</div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{card.title}</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-4">{card.description}</p>
              <ul className="space-y-3 mb-6">
                {card.features.map((feature, i) => (
                  <li key={i} className="text-sm py-2 border-b border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                    {feature}
                  </li>
                ))}
              </ul>
              <a
                href={card.cta.href}
                className="block w-full text-center px-6 py-3 bg-yellow-400 text-slate-900 rounded-full font-bold hover:bg-yellow-500 transition-colors"
              >
                {card.cta.text}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
