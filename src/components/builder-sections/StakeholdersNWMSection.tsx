'use client';

import { SmartImage } from '@/components/ui/SmartImage';

interface StakeholderCard {
  title: string;
  description: string;
  pills: string[];
}

interface StakeholdersNWMSectionProps {
  eyebrow?: string;
  title: string;
  description: string;
  mediaPlaceholder?: string;
  mediaImage?: string;
  cards: StakeholderCard[];
}

export default function StakeholdersNWMSection({
  eyebrow = 'Value for every stakeholder',
  title,
  description,
  mediaPlaceholder = 'Drop stakeholder demo video or image here',
  mediaImage,
  cards = []
}: StakeholdersNWMSectionProps) {
  return (
    <section className="py-12 md:py-20 px-4 md:px-6 bg-white dark:bg-slate-950 relative overflow-hidden">
      {/* Decorative gradient blobs */}
      <div className="hidden md:block absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      <div className="hidden md:block absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-8 md:mb-12">
          <span className="text-xs uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-2 md:mb-3 block">{eyebrow}</span>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-3 md:mb-4">{title}</h2>
          <p className="text-base md:text-lg text-slate-700 dark:text-slate-300">{description}</p>
        </div>

        {/* Media Section */}
        <div className="mb-6 md:mb-10">
          {mediaImage ? (
            <div className="rounded-2xl md:rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-cyan-500/50 transition-all duration-300">
              <SmartImage
                src={mediaImage}
                alt="Stakeholders media"
                className="w-full aspect-video object-cover"
              />
            </div>
          ) : (
            <div className="rounded-2xl md:rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-gradient-to-br from-cyan-500/20 to-violet-500/20 dark:from-cyan-500/10 dark:to-violet-500/10 aspect-video flex items-center justify-center md:backdrop-blur-sm hover:border-solid transition-all duration-300">
              <span className="text-xs md:text-sm text-slate-600 dark:text-slate-400 text-center px-4">{mediaPlaceholder}</span>
            </div>
          )}
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {cards.map((card, idx) => (
            <div
              key={idx}
              className="relative overflow-hidden rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-white/90 dark:bg-slate-900/60 p-4 md:p-5 md:backdrop-blur-sm hover:border-cyan-500/50 dark:hover:border-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-500/20 dark:hover:shadow-cyan-500/20 md:hover:-translate-y-2 transition-all duration-500 group cursor-pointer"
            >
              {/* Decorative glow - stronger on hover */}
              <div className="hidden md:block absolute -left-8 -top-10 w-24 h-24 rounded-full bg-cyan-500/30 dark:bg-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl" />
              
              {/* Glass gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 via-transparent to-violet-500/0 md:group-hover:from-cyan-500/10 md:group-hover:to-violet-500/10 transition-all duration-500" />
              
              {/* Animated border gradient */}
              <div className="hidden md:block absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-cyan-500/20 via-violet-500/20 to-cyan-500/20 blur-xl" />
              
              <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white mb-2 relative z-10 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors duration-300">{card.title}</h3>
              <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 mb-3 md:mb-4 relative z-10">{card.description}</p>
              
              <div className="flex flex-wrap gap-1.5 md:gap-2 relative z-10">
                {card.pills.map((pill, i) => (
                  <span
                    key={i}
                    className="px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 group-hover:border-cyan-500/50 group-hover:bg-cyan-500/10 transition-all duration-300"
                  >
                    {pill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
