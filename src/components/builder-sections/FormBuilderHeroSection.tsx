/**
 * Form Builder Hero Section - Dynamic version with media support
 */

'use client';

import { SmartImage } from '@/components/ui/SmartImage';

interface HeroFeature {
  icon: string;
  label: string;
}

interface FormBuilderHeroSectionProps {
  badge?: string;
  title: string;
  titleHighlight: string;
  description: string;
  primaryButton: {
    text: string;
    href: string;
  };
  secondaryButton: {
    text: string;
    href: string;
  };
  badges: string[];
  mediaType?: 'placeholder' | 'image' | 'video';
  mediaUrl?: string;
  mediaAlt?: string;
  canvasIcon?: string;
  canvasLabel?: string;
  features: HeroFeature[];
  backgroundColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
}

export default function FormBuilderHeroSection({
  badge = 'Collect form data seamlessly. Gain real-time visibility.',
  title,
  titleHighlight,
  description,
  primaryButton,
  secondaryButton,
  badges,
  mediaType = 'placeholder',
  mediaUrl,
  mediaAlt = 'Form Builder Canvas',
  canvasIcon = '🎨',
  canvasLabel = 'Form Canvas | Fields | Rules | Preview',
  features,
  backgroundColor = 'bg-gradient-to-br from-fuchsia-50 via-rose-50 to-pink-50 dark:from-fuchsia-950 dark:via-rose-950 dark:to-pink-950',
  gradientFrom = 'from-fuchsia-400',
  gradientTo = 'to-pink-400'
}: FormBuilderHeroSectionProps) {
  return (
    <section className={`relative ${backgroundColor} text-slate-900 dark:text-white overflow-hidden`}>
      <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-200/30 via-transparent to-pink-200/30 dark:from-fuchsia-600/20 dark:via-transparent dark:to-pink-500/20" />
      
      <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-32">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 dark:bg-white/10 border border-white/10 dark:border-white/10 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {badge}
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
              {title}{' '}
              <span className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} bg-clip-text text-transparent`}>
                {titleHighlight}
              </span>
            </h1>
            
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
              {description}
            </p>
            
            <div className="flex flex-wrap gap-4">
              <a 
                href={primaryButton.href}
                className="px-6 py-3 text-base font-semibold bg-gradient-to-r from-fuchsia-600 to-pink-500 hover:from-fuchsia-700 hover:to-pink-600 text-white border-0 rounded-lg transition-all shadow-lg hover:shadow-xl"
              >
                {primaryButton.text}
              </a>
              <a 
                href={secondaryButton.href}
                className="px-6 py-3 text-base font-semibold border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
              >
                {secondaryButton.text}
              </a>
            </div>
            
            <div className="flex gap-3">
              {badges.map((badgeText) => (
                <span 
                  key={badgeText}
                  className="px-3 py-1 text-xs rounded-full bg-white/10 dark:bg-white/10 border border-white/15 dark:border-white/15 text-slate-600 dark:text-slate-300"
                >
                  {badgeText}
                </span>
              ))}
            </div>
          </div>
          
          <div className="relative">
            <div className="rounded-3xl bg-gradient-to-br from-fuchsia-600/20 to-pink-500/20 dark:from-fuchsia-600/20 dark:to-pink-500/20 p-6 border border-white/10 dark:border-white/10 backdrop-blur-sm">
              {mediaType === 'image' && mediaUrl ? (
                <div className="aspect-[4/3] rounded-2xl border border-white/10 dark:border-white/10 overflow-hidden mb-4">
                  <SmartImage 
                    src={mediaUrl} 
                    alt={mediaAlt}
                    className="w-full h-full"
                  />
                </div>
              ) : mediaType === 'video' && mediaUrl ? (
                <div className="aspect-[4/3] rounded-2xl border border-white/10 dark:border-white/10 overflow-hidden mb-4">
                  <video 
                    src={mediaUrl}
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                </div>
              ) : (
                <div className="aspect-[4/3] bg-white/80 dark:bg-slate-800/50 rounded-2xl border border-white/10 dark:border-white/10 flex items-center justify-center mb-4">
                  <div className="text-center text-slate-600 dark:text-slate-400">
                    <div className="text-4xl mb-2">{canvasIcon}</div>
                    <p className="text-sm">{canvasLabel}</p>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-3 gap-3">
                {features.map((item) => (
                  <div 
                    key={item.label}
                    className="bg-white/5 dark:bg-white/5 border border-white/10 dark:border-white/10 rounded-xl p-3 text-center hover:-translate-y-1 transition-transform"
                  >
                    <div className="text-lg mb-1">{item.icon}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-300">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
