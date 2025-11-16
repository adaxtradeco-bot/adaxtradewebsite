'use client';

import * as Icons from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface Benefit {
  id: string;
  icon: string;
  title: string;
  description: string;
}

interface BenefitGridSectionProps {
  data: {
    title: string;
    subtitle?: string;
    benefits: Benefit[];
  };
  style?: {
    columns?: 2 | 3 | 4;
    iconColor?: string;
  };
}

export default function BenefitGridSection({ data, style = { columns: 3 } }: BenefitGridSectionProps) {
  const getIcon = (iconName: string) => {
    const Icon = (Icons as any)[iconName] as LucideIcon;
    return Icon || Icons.CheckCircle;
  };

  const columns = style?.columns || 3;

  return (
    <section className="py-20 bg-white dark:bg-slate-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            {data.title}
          </h2>
          {data.subtitle && (
            <p className="text-lg text-slate-600 dark:text-slate-400">
              {data.subtitle}
            </p>
          )}
        </div>

        <div className={`grid gap-8 ${
          columns === 4 ? 'md:grid-cols-2 lg:grid-cols-4' :
          columns === 3 ? 'md:grid-cols-2 lg:grid-cols-3' :
          'md:grid-cols-2'
        }`}>
          {data.benefits.map((benefit) => {
            const Icon = getIcon(benefit.icon);
            return (
              <div
                key={benefit.id}
                className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-xl dark:hover:shadow-slate-700/50 transition-all group"
              >
                <div className="w-14 h-14 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-7 h-7 text-violet-600 dark:text-violet-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  {benefit.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
