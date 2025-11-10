'use client';

import { ArrowRight } from 'lucide-react';

interface CTASectionProps {
  data: {
    title: string;
    description: string;
    primaryButton: {
      text: string;
      link: string;
    };
    secondaryButton?: {
      text: string;
      link: string;
    };
  };
  style: {
    variant: 'gradient' | 'solid' | 'outlined';
    alignment: 'left' | 'center' | 'right';
    size: 'sm' | 'md' | 'lg';
  };
}

export default function CTASection({ data, style = { variant: 'gradient', alignment: 'center', size: 'md' } }: CTASectionProps) {
  const sizeClasses: Record<string, string> = {
    sm: 'py-12',
    md: 'py-20',
    lg: 'py-32',
  };

  const alignmentClasses: Record<string, string> = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  };

  const variantClasses: Record<string, string> = {
    gradient: 'bg-gradient-to-r from-violet-600 to-cyan-600 dark:from-violet-700 dark:to-cyan-700',
    solid: 'bg-slate-900 dark:bg-slate-800',
    outlined: 'bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700',
  };

  const textColorClasses: Record<string, string> = {
    gradient: 'text-white',
    solid: 'text-white',
    outlined: 'text-slate-900 dark:text-white',
  };

  return (
    <section className={`${sizeClasses[style?.size || 'md']} ${variantClasses[style?.variant || 'gradient']} transition-colors`}>
      <div className="container mx-auto px-4">
        <div className={`flex flex-col gap-8 ${alignmentClasses[style?.alignment || 'center']}`}>
          <div className="max-w-3xl">
            <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${textColorClasses[style?.variant || 'gradient']}`}>
              {data.title}
            </h2>
            <p className={`text-lg md:text-xl ${
              style?.variant === 'outlined'
                ? 'text-slate-600 dark:text-slate-400'
                : 'text-white/90'
            }`}>
              {data.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <a
              href={data.primaryButton?.link || '#'}
              className={`px-8 py-4 rounded-xl font-semibold transition-all inline-flex items-center gap-2 group ${
                style?.variant === 'outlined'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100'
                  : 'bg-white text-slate-900 hover:bg-slate-100'
              }`}
            >
              {data.primaryButton?.text || 'Get Started'}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>

            {data.secondaryButton && (
              <a
                href={data.secondaryButton?.link || '#'}
                className={`px-8 py-4 rounded-xl font-semibold transition-all ${
                  style?.variant === 'outlined'
                    ? 'border-2 border-slate-900 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    : 'border-2 border-white text-white hover:bg-white/10'
                }`}
              >
                {data.secondaryButton?.text || 'Learn More'}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
