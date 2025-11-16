/**
 * Industry Cards Section
 * Grid of industry solution cards with icon, features list, and CTA
 */

'use client';

import Link from 'next/link';

interface IndustryCard {
  icon: string;
  title: string;
  description: string;
  features: string[];
  ctaText: string;
  ctaLink: string;
}

interface IndustryCardsSectionProps {
  data: {
    eyebrow?: string;
    title: string;
    subtitle?: string;
    cards: IndustryCard[];
  };
  style?: {
    columns?: 2 | 3 | 4;
  };
}

export default function IndustryCardsSection({ data, style = { columns: 3 } }: IndustryCardsSectionProps) {
  const columns = style?.columns || 3;

  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          {data.eyebrow && (
            <span className="inline-block px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-sm uppercase tracking-wider mb-4">
              {data.eyebrow}
            </span>
          )}
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
            {data.title}
          </h2>
          {data.subtitle && (
            <p className="text-lg text-slate-600 dark:text-slate-400">
              {data.subtitle}
            </p>
          )}
        </div>

        {/* Cards Grid */}
        <div className={`grid gap-6 ${
          columns === 4 ? 'md:grid-cols-2 lg:grid-cols-4' :
          columns === 3 ? 'md:grid-cols-2 lg:grid-cols-3' :
          'md:grid-cols-2'
        }`}>
          {data.cards.map((card, index) => (
            <div
              key={index}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-2xl dark:hover:shadow-slate-700/50 transition-all duration-300 hover:-translate-y-2 group"
            >
              {/* Card Header */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 p-8 text-center border-b border-slate-700">
                <div className="text-5xl mb-3 filter drop-shadow-lg group-hover:scale-110 transition-transform">
                  {card.icon}
                </div>
                <h3 className="text-xl font-bold text-white">
                  {card.title}
                </h3>
              </div>

              {/* Card Body */}
              <div className="p-6">
                <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                  {card.description}
                </p>

                {/* Features List */}
                <ul className="space-y-2 mb-6">
                  {card.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300 py-2 border-b border-slate-100 dark:border-slate-700 last:border-0"
                    >
                      <span className="text-blue-600 dark:text-blue-400 font-bold mt-0.5">→</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <Link
                    href={card.ctaLink}
                    className="block w-full text-center px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold transition-all shadow-lg hover:shadow-xl"
                  >
                    {card.ctaText}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
