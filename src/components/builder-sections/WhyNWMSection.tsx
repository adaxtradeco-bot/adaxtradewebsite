'use client';

interface WhyCard {
  title: string;
  description: string;
  features: string[];
}

interface WhyNWMSectionProps {
  eyebrow?: string;
  title: string;
  description: string;
  cards: WhyCard[];
}

export default function WhyNWMSection({
  eyebrow = 'Why NWMFlow',
  title,
  description,
  cards = []
}: WhyNWMSectionProps) {
  return (
    <section className="py-20 px-6 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-12">
          <span className="text-xs uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-3 block">{eyebrow}</span>
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">{title}</h2>
          <p className="text-lg text-slate-700 dark:text-slate-300">{description}</p>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {cards.map((card, idx) => (
            <article
              key={idx}
              className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-700/50 bg-gradient-to-br from-violet-500/20 to-white dark:from-violet-500/10 dark:to-slate-900/90 p-6 shadow-2xl backdrop-blur-sm hover:border-cyan-500/50 hover:shadow-cyan-500/20 hover:scale-[1.02] transition-all duration-500 group cursor-pointer"
            >
              {/* Decorative circle - animated on hover */}
              <div className="absolute -right-10 -bottom-10 w-28 h-28 rounded-full border border-dashed border-cyan-500/25 dark:border-cyan-500/25 group-hover:border-cyan-500/50 group-hover:scale-110 transition-all duration-500" />
              
              {/* Glass overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-violet-500/0 group-hover:from-cyan-500/5 group-hover:to-violet-500/5 transition-all duration-500" />
              
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 relative z-10 group-hover:text-cyan-400 dark:group-hover:text-cyan-400 transition-colors duration-300">{card.title}</h3>
              <p className="text-slate-700 dark:text-slate-300 mb-4 relative z-10">{card.description}</p>
              
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400 relative z-10">
                {card.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-300">
                    <span className="text-cyan-400 dark:text-cyan-400 mt-1 group-hover:scale-125 transition-transform duration-300">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
