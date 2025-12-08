'use client';

interface EcosystemColumn {
  title: string;
  items: string[];
}

interface EcosystemNWMSectionProps {
  eyebrow?: string;
  title: string;
  description: string;
  columns: EcosystemColumn[];
}

export default function EcosystemNWMSection({
  eyebrow = 'The complete automation ecosystem',
  title,
  description,
  columns = []
}: EcosystemNWMSectionProps) {
  return (
    <section className="py-12 md:py-20 px-4 md:px-6 bg-white dark:bg-slate-950 relative overflow-hidden">
      {/* Separator gradient line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
      
      <div className="max-w-7xl mx-auto">
        <div className="rounded-2xl md:rounded-[2rem] border border-slate-200 dark:border-slate-700/50 bg-gradient-to-br from-cyan-500/10 via-white to-violet-500/10 dark:from-cyan-500/5 dark:via-slate-900/90 dark:to-violet-500/5 p-6 md:p-10 shadow-2xl md:backdrop-blur-sm hover:shadow-cyan-500/10 transition-all duration-500">
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 md:gap-6 mb-6 md:mb-10">
            <div>
              <span className="text-xs uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-2 md:mb-3 block">{eyebrow}</span>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">{title}</h2>
            </div>
            <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 max-w-md">{description}</p>
          </div>

          {/* Columns Grid */}
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {columns.map((column, idx) => (
              <div key={idx} className="group">
                <h3 className="text-base md:text-lg font-semibold text-slate-900 dark:text-white mb-3 md:mb-4 group-hover:text-cyan-400 dark:group-hover:text-cyan-400 transition-colors duration-300">{column.title}</h3>
                <ul className="space-y-2 md:space-y-3">
                  {column.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 md:gap-3 text-slate-700 dark:text-slate-300 text-xs md:text-sm hover:text-cyan-400 dark:hover:text-cyan-400 transition-colors duration-200 cursor-pointer">
                      <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-violet-400 mt-1.5 md:mt-2 flex-shrink-0 md:group-hover:scale-125 transition-transform duration-300" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
