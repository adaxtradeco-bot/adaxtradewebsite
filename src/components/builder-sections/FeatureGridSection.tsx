'use client';

import { LucideIcon } from 'lucide-react';
import * as Icons from 'lucide-react';

interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
  color: string;
}

interface FeatureGridSectionProps {
  data: {
    title: string;
    subtitle: string;
    features: Feature[];
  };
  style: {
    columns: 2 | 3 | 4;
    iconSize: 'sm' | 'md' | 'lg';
    showBackground: boolean;
  };
}

export default function FeatureGridSection({ data, style = { columns: 3, iconSize: 'md', showBackground: true } }: FeatureGridSectionProps) {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const getIcon = (iconName: string) => {
    const Icon = (Icons as any)[iconName] as LucideIcon;
    return Icon || Icons.Box;
  };

  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-900 transition-colors">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            {data.title}
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            {data.subtitle}
          </p>
        </div>

        <div className={`grid gap-8 ${
          style?.columns === 4 ? 'md:grid-cols-2 lg:grid-cols-4' :
          style?.columns === 3 ? 'md:grid-cols-2 lg:grid-cols-3' :
          'md:grid-cols-2'
        }`}>
          {data.features.map((feature) => {
            const Icon = getIcon(feature.icon);
            return (
              <div
                key={feature.id}
                className={`${
                  style?.showBackground
                    ? 'bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 hover:shadow-xl dark:hover:shadow-slate-700/50'
                    : 'p-4'
                } transition-all group`}
              >
                <div
                  className={`${iconSizes[style?.iconSize || 'md']} mb-4 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110`}
                  style={{ backgroundColor: `${feature.color}20` }}
                >
                  <Icon className={iconSizes[style?.iconSize || 'md']} style={{ color: feature.color }} />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
