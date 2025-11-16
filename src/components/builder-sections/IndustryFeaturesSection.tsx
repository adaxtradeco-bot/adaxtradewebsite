'use client';

import * as Icons from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import Image from 'next/image';

interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
  details?: string[];
}

interface IndustryFeaturesSectionProps {
  data: {
    title: string;
    subtitle?: string;
    image?: string;
    features: Feature[];
  };
  style?: {
    layout?: 'image-left' | 'image-right' | 'no-image';
    imagePosition?: 'left' | 'right';
  };
}

export default function IndustryFeaturesSection({ data, style = {} }: IndustryFeaturesSectionProps) {
  const getIcon = (iconName: string) => {
    const Icon = (Icons as any)[iconName] as LucideIcon;
    return Icon || Icons.CheckCircle;
  };

  const hasImage = data.image && style?.layout !== 'no-image';
  const imageOnRight = style?.imagePosition === 'right';

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

        <div className={`grid ${hasImage ? 'lg:grid-cols-2' : 'lg:grid-cols-1'} gap-12 items-center max-w-6xl mx-auto`}>
          {hasImage && (
            <div className={`${imageOnRight ? 'lg:order-2' : ''} relative h-96 rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-700`}>
              <Image
                src={data.image!}
                alt={data.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          <div className="space-y-6">
            {data.features.map((feature) => {
              const Icon = getIcon(feature.icon);
              return (
                <div
                  key={feature.id}
                  className="flex gap-4 p-6 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-lg dark:hover:shadow-slate-700/50 transition-all"
                >
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-3">
                      {feature.description}
                    </p>
                    {feature.details && feature.details.length > 0 && (
                      <ul className="space-y-1">
                        {feature.details.map((detail, index) => (
                          <li key={index} className="text-sm text-slate-500 dark:text-slate-500 flex items-start gap-2">
                            <span className="text-violet-500 mt-0.5">•</span>
                            {detail}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
