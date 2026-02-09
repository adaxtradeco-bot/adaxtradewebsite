/**
 * Feature Cards Section with Details List
 * Simple cards with icon, title, and bullet points
 */

'use client';

import * as Icons from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface FeatureCard {
  icon: string;
  title: string;
  description?: string;
  details?: string[];
  badge?: string;
}

interface FeatureCardsSectionProps {
  data: {
    title?: string;
    subtitle?: string;
    cards: FeatureCard[];
  };
  style?: {
    columns?: 2 | 3 | 4;
    showBullets?: boolean;
  };
}

export default function FeatureCardsSection({ data, style = { columns: 3, showBullets: true } }: FeatureCardsSectionProps) {
  const getIcon = (iconName: string) => {
    const Icon = (Icons as any)[iconName] as LucideIcon;
    return Icon || Icons.CheckCircle;
  };

  const columns = style?.columns || 3;

  return (
    <section className="py-16 bg-white dark:bg-slate-900">
      <div className="container mx-auto px-4 max-w-7xl">
        {(data.title || data.subtitle) && (
          <div className="text-center mb-12 max-w-3xl mx-auto">
            {data.title && (
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                {data.title}
              </h2>
            )}
            {data.subtitle && (
              <p className="text-lg text-slate-600 dark:text-slate-400">
                {data.subtitle}
              </p>
            )}
          </div>
        )}

        <div className={`grid gap-6 ${
          columns === 4 ? 'md:grid-cols-2 lg:grid-cols-4' :
          columns === 3 ? 'md:grid-cols-2 lg:grid-cols-3' :
          'md:grid-cols-2'
        }`}>
          {data.cards.map((card, index) => {
            const Icon = getIcon(card.icon);
            return (
              <div
                key={index}
                className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-lg dark:hover:shadow-slate-700/50 transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {card.title}
                  </h3>
                </div>
                
                {card.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    {card.description}
                  </p>
                )}

                {card.details && card.details.length > 0 && (
                  <ul className="space-y-2">
                    {card.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                        {style?.showBullets && (
                          <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-amber-500 to-blue-600 mt-1.5 flex-shrink-0" />
                        )}
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                )}
                
                {card.badge && (
                  <span className="inline-block mt-3 text-xs px-3 py-1 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 text-white">
                    Value: {card.badge}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
