'use client';

interface FinalCTANWMSectionProps {
  eyebrow?: string;
  title: string;
  description: string;
  primaryButton: {
    text: string;
    href: string;
  };
  secondaryButton: {
    text: string;
    href: string;
  };
}

export default function FinalCTANWMSection({
  eyebrow = 'Ready to see it live?',
  title,
  description,
  primaryButton,
  secondaryButton
}: FinalCTANWMSectionProps) {
  return (
    <section className="py-12 md:py-20 px-4 md:px-6 bg-white dark:bg-slate-950 relative overflow-hidden">
      {/* Dramatic gradient separator */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-cyan-500/50 via-violet-500/50 to-cyan-500/50" />
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-violet-500/5" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="rounded-2xl md:rounded-[2rem] border border-slate-200 dark:border-slate-700/50 bg-gradient-to-br from-cyan-500/10 via-white to-violet-500/10 dark:from-cyan-500/5 dark:via-slate-900/90 dark:to-violet-500/5 p-6 md:p-10 shadow-2xl md:backdrop-blur-sm hover:shadow-cyan-500/20 hover:border-cyan-500/30 transition-all duration-500 group relative overflow-hidden">
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-violet-500/0 to-cyan-500/0 md:group-hover:from-cyan-500/5 md:group-hover:via-violet-500/5 md:group-hover:to-cyan-500/5 transition-all duration-700" />
          <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-6 md:gap-8">
            {/* Content */}
            <div className="flex-1 relative z-10 text-center lg:text-left">
              <span className="text-xs uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-2 md:mb-3 block">{eyebrow}</span>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-2 md:mb-3 group-hover:text-cyan-400 dark:group-hover:text-cyan-400 transition-colors duration-300">{title}</h2>
              <p className="text-base md:text-lg text-slate-700 dark:text-slate-300">{description}</p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full lg:w-auto relative z-10">
              <a
                href={primaryButton.href}
                className="w-full sm:w-auto text-center px-5 md:px-6 py-2.5 md:py-3 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-medium text-sm md:text-base hover:shadow-lg hover:shadow-cyan-500/50 md:hover:-translate-y-1 hover:scale-105 transition-all duration-300 whitespace-nowrap"
              >
                {primaryButton.text}
              </a>
              <a
                href={secondaryButton.href}
                className="w-full sm:w-auto text-center px-5 md:px-6 py-2.5 md:py-3 rounded-full border border-slate-600 dark:border-slate-600 bg-transparent dark:bg-transparent text-slate-900 dark:text-white text-sm md:text-base hover:bg-slate-800 dark:hover:bg-slate-800 md:hover:-translate-y-1 transition-all duration-300 whitespace-nowrap md:backdrop-blur-md"
              >
                {secondaryButton.text}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
