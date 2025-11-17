/**
 * Workflow Hero Section - Dynamic version
 */

'use client';

interface HeroCard {
  icon: string;
  title: string;
  description: string;
}

interface WorkflowHeroSectionProps {
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
  footerText?: string;
  cards: HeroCard[];
  backgroundColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
}

export default function WorkflowHeroSection({
  badge = 'Live orchestration for modern teams',
  title,
  titleHighlight,
  description,
  primaryButton,
  secondaryButton,
  footerText = 'Secure • Extensible • Real-time visibility',
  cards,
  backgroundColor = 'bg-gradient-to-br from-indigo-50 via-slate-50 to-cyan-50 dark:from-indigo-950 dark:via-slate-900 dark:to-cyan-950',
  gradientFrom = 'from-indigo-400',
  gradientTo = 'to-cyan-400'
}: WorkflowHeroSectionProps) {
  return (
    <section className={`relative ${backgroundColor} text-slate-900 dark:text-white overflow-hidden`}>
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-200/30 via-transparent to-cyan-200/30 dark:from-indigo-600/20 dark:via-transparent dark:to-cyan-500/20" />
      
      <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
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
                className="px-6 py-3 text-base font-semibold bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white border-0 rounded-lg transition-all"
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
            
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {footerText}
            </div>
          </div>
          
          <div className="relative">
            <div className="rounded-3xl bg-gradient-to-br from-indigo-600/20 to-cyan-500/20 dark:from-indigo-600/20 dark:to-cyan-500/20 p-6 border border-white/10 dark:border-white/10 backdrop-blur-sm">
              <div className="grid sm:grid-cols-2 gap-4">
                {cards.map((item, index) => (
                  <div 
                    key={index}
                    className="bg-white/5 dark:bg-white/5 border border-white/10 dark:border-white/10 rounded-2xl p-4 hover:-translate-y-1 transition-transform"
                  >
                    <div className="text-xl mb-2">{item.icon}</div>
                    <div className="font-semibold text-slate-900 dark:text-white mb-1">{item.title}</div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">{item.description}</p>
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
