/**
 * Features Grid NWM Section
 * Author: Amazon Q
 * Created: 2024-12-XX
 * Updated: 2025-01-XX - Added IconFieldEditor support and image position
 */

'use client';

import React from 'react';
import { IconConfig, IconDisplay } from '@/components/ui/IconPicker';

interface FeatureCard {
  title: string;
  description: string;
  icon?: string | IconConfig;
  image?: string;
  imagePosition?: 'top' | 'bottom';
}

interface FeaturesGridNWMSectionProps {
  eyebrow?: string;
  title: string;
  description: string;
  features: FeatureCard[];
}

export default function FeaturesGridNWMSection({
  eyebrow = 'Core capabilities',
  title,
  description,
  features = []
}: FeaturesGridNWMSectionProps) {
  return (
    <section className="py-12 md:py-20 px-4 md:px-6 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      {/* Decorative separator and gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
      <div className="hidden md:block absolute top-1/3 right-0 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="hidden md:block absolute bottom-1/3 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-8 md:mb-12">
          <span className="text-xs uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-2 md:mb-3 block">{eyebrow}</span>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-3 md:mb-4">{title}</h2>
          <p className="text-base md:text-lg text-slate-700 dark:text-slate-300">{description}</p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="relative overflow-hidden rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-white/90 dark:bg-slate-900/60 p-4 md:p-6 md:backdrop-blur-sm hover:border-cyan-500/50 dark:hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/20 md:hover:-translate-y-1 md:hover:scale-[1.02] transition-all duration-500 group cursor-pointer"
            >
              {/* Decorative glow - stronger on hover */}
              <div className="hidden md:block absolute -top-10 -right-10 w-24 h-24 rounded-full bg-violet-500/20 dark:bg-violet-500/20 blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Glass gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-violet-500/0 md:group-hover:from-cyan-500/5 md:group-hover:to-violet-500/5 transition-all duration-500" />
              
              {/* Image at top */}
              {feature.image && feature.imagePosition === 'top' && (
                <div className="mb-3 relative z-10">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                </div>
              )}
              
              <div className="flex items-start gap-3 mb-2 relative z-10">
                {feature.icon && (
                  <span className="text-2xl flex-shrink-0">
                    {typeof feature.icon === 'string' ? feature.icon : <IconDisplay icon={feature.icon} className="w-6 h-6" />}
                  </span>
                )}
                <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white group-hover:text-cyan-400 dark:group-hover:text-cyan-400 transition-colors duration-300 flex-1">{feature.title}</h3>
              </div>
              <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 relative z-10">{feature.description}</p>
              
              {/* Image at bottom */}
              {feature.image && feature.imagePosition === 'bottom' && (
                <div className="mt-3 relative z-10">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
