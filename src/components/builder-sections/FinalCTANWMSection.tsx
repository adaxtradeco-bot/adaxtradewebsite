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
    <section className="py-20 px-6 bg-white dark:bg-slate-950 relative overflow-hidden">
      {/* Dramatic gradient separator */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-cyan-500/50 via-violet-500/50 to-cyan-500/50" />
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-violet-500/5" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="rounded-[2rem] border border-slate-200 dark:border-slate-700/50 bg-gradient-to-br from-cyan-500/10 via-white to-violet-500/10 dark:from-cyan-500/5 dark:via-slate-900/90 dark:to-violet-500/5 p-10 shadow-2xl backdrop-blur-sm hover:shadow-cyan-500/20 hover:border-cyan-500/30 transition-all duration-500 group relative overflow-hidden">
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-violet-500/0 to-cyan-500/0 group-hover:from-cyan-500/5 group-hover:via-violet-500/5 group-hover:to-cyan-500/5 transition-all duration-700" />
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Content */}
            <div className="flex-1 relative z-10">
              <span className="text-xs uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-3 block">{eyebrow}</span>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-cyan-400 dark:group-hover:text-cyan-400 transition-colors duration-300">{title}</h2>
              <p className="text-lg text-slate-700 dark:text-slate-300">{description}</p>
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap gap-4 justify-end relative z-10">
              <a
                href={primaryButton.href}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-medium hover:shadow-lg hover:shadow-cyan-500/50 hover:-translate-y-1 hover:scale-105 transition-all duration-300 whitespace-nowrap"
              >
                {primaryButton.text}
              </a>
              <a
                href={secondaryButton.href}
                className="px-6 py-3 rounded-full border border-slate-600 dark:border-slate-600 bg-transparent dark:bg-transparent text-slate-900 dark:text-white hover:bg-slate-800 dark:hover:bg-slate-800 hover:-translate-y-1 transition-all duration-300 whitespace-nowrap backdrop-blur-md"
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
