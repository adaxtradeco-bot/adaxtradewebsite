'use client';

interface PartnerCard {
  title: string;
  description: string;
  features: string[];
}

interface PartnersNWMSectionProps {
  eyebrow?: string;
  title: string;
  description: string;
  cards: PartnerCard[];
  ctaButtons?: {
    primary: { text: string; href: string };
    secondary: { text: string; href: string };
  };
}

export default function PartnersNWMSection({
  eyebrow = 'Partner program',
  title,
  description,
  cards = [],
  ctaButtons
}: PartnersNWMSectionProps) {
  return (
    <section className="py-12 md:py-20 px-4 md:px-6 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      {/* Decorative separator */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
      <div className="hidden md:block absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      <div className="hidden md:block absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-8 md:mb-12">
          <span className="text-xs uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-2 md:mb-3 block">{eyebrow}</span>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-3 md:mb-4">{title}</h2>
          <p className="text-base md:text-lg text-slate-700 dark:text-slate-300">{description}</p>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-10">
          {cards.map((card, idx) => (
            <div
              key={idx}
              className="rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-700/50 bg-gradient-to-br from-violet-500/20 to-white dark:from-violet-500/10 dark:to-slate-900/90 p-5 md:p-6 shadow-2xl hover:shadow-violet-500/20 hover:border-violet-500/50 md:hover:scale-[1.02] transition-all duration-500 group cursor-pointer relative overflow-hidden"
            >
              {/* Glass overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/0 to-cyan-500/0 md:group-hover:from-violet-500/5 md:group-hover:to-cyan-500/5 transition-all duration-500" />
              
              <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-2 md:mb-3 relative z-10 group-hover:text-violet-400 dark:group-hover:text-violet-400 transition-colors duration-300">{card.title}</h3>
              <p className="text-slate-700 dark:text-slate-300 mb-3 md:mb-4 text-xs md:text-sm relative z-10">{card.description}</p>
              
              <ul className="space-y-2 text-xs md:text-sm text-slate-600 dark:text-slate-400 relative z-10">
                {card.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-300">
                    <span className="text-cyan-400 dark:text-cyan-400 mt-1 md:group-hover:scale-125 transition-transform duration-300">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        {ctaButtons && (
          <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4">
            <a
              href={ctaButtons.primary.href}
              className="w-full sm:w-auto text-center px-5 md:px-6 py-2.5 md:py-3 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-medium text-sm md:text-base hover:shadow-lg hover:shadow-cyan-500/50 hover:-translate-y-0.5 hover:scale-105 transition-all duration-300"
            >
              {ctaButtons.primary.text}
            </a>
            <a
              href={ctaButtons.secondary.href}
              className="w-full sm:w-auto text-center px-5 md:px-6 py-2.5 md:py-3 rounded-full border border-slate-300 dark:border-slate-600 bg-white/90 dark:bg-slate-900/80 text-slate-900 dark:text-white text-sm md:text-base hover:bg-white dark:hover:bg-slate-800 hover:-translate-y-0.5 transition-all duration-300 md:backdrop-blur-md"
            >
              {ctaButtons.secondary.text}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
