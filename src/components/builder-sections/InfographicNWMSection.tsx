'use client';

interface OrgNode {
  title: string;
  description: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

interface InfographicNWMSectionProps {
  eyebrow?: string;
  title: string;
  description: string;
  coreLabel?: string;
  coreSubLabel?: string;
  farmLabel?: string;
  portalLabel?: string;
  orgNodes: OrgNode[];
  notesTitle?: string;
  notesDescription?: string;
  notesList: string[];
  imagePlaceholder?: string;
}

export default function InfographicNWMSection({
  eyebrow = 'Architecture snapshot',
  title,
  description,
  coreLabel = 'NWMFlow Core',
  coreSubLabel = 'Forms · Workflows · Data · Automation',
  farmLabel = 'Farm / Multi-org Layer',
  portalLabel = 'Portals & Workspaces',
  orgNodes = [],
  notesTitle = 'Use this block for a visual or diagram.',
  notesDescription,
  notesList = [],
  imagePlaceholder = 'Drop your architecture diagram / infographic here'
}: InfographicNWMSectionProps) {
  const positionClasses = {
    'top-left': 'top-[8%] left-[8%]',
    'top-right': 'top-[8%] right-[8%]',
    'bottom-left': 'bottom-[8%] left-[8%]',
    'bottom-right': 'bottom-[8%] right-[8%]'
  };

  return (
    <section className="py-20 px-6 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      {/* Decorative separator */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-12">
          <span className="text-xs uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-3 block">{eyebrow}</span>
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">{title}</h2>
          <p className="text-lg text-slate-700 dark:text-slate-300">{description}</p>
        </div>

        {/* Layout */}
        <div className="grid lg:grid-cols-[1.4fr_1.2fr] gap-10 items-center">
          {/* Diagram */}
          <div className="relative w-full aspect-[4/3] rounded-3xl border border-slate-200 dark:border-slate-700/50 bg-gradient-to-br from-cyan-500/5 via-slate-900/90 to-violet-500/5 dark:from-cyan-500/5 dark:via-slate-900/90 dark:to-violet-500/5 overflow-hidden shadow-2xl hover:shadow-cyan-500/20 transition-all duration-500 group">
            {/* Core Circle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[42%] aspect-square rounded-full bg-gradient-to-br from-white to-white/90 flex flex-col items-center justify-center text-center p-4 shadow-2xl">
              <span className="font-semibold text-slate-900 text-sm">{coreLabel}</span>
              <span className="text-xs text-slate-700 mt-1">{coreSubLabel}</span>
            </div>

            {/* Farm Ring */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[78%] h-[78%] rounded-full border border-dashed border-slate-600 dark:border-slate-600 group-hover:border-cyan-500/50 transition-colors duration-500">
              <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs uppercase tracking-widest text-slate-600 dark:text-slate-400 bg-slate-900 dark:bg-slate-900 px-2">
                {farmLabel}
              </span>
            </div>

            {/* Portal Ring */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full rounded-full border border-dashed border-slate-600 dark:border-slate-600 group-hover:border-violet-500/50 transition-colors duration-500">
              <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs uppercase tracking-widest text-slate-600 dark:text-slate-400 bg-slate-900 dark:bg-slate-900 px-2">
                {portalLabel}
              </span>
            </div>

            {/* Org Nodes */}
            {orgNodes.map((node, idx) => (
              <div
                key={idx}
                className={`absolute w-[32%] max-w-[140px] rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-900/95 dark:bg-slate-900/95 p-3 text-sm hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20 hover:scale-105 transition-all duration-300 cursor-pointer ${positionClasses[node.position]}`}
              >
                <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">{node.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">{node.description}</p>
              </div>
            ))}
          </div>

          {/* Notes */}
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{notesTitle}</h3>
            {notesDescription && (
              <p className="text-slate-700 dark:text-slate-300 mb-4">{notesDescription}</p>
            )}

            {/* Image Placeholder */}
            <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-gradient-to-br from-cyan-500/10 to-violet-500/10 dark:from-cyan-500/10 dark:to-violet-500/10 p-6 text-center mb-4 hover:border-solid transition-all duration-300">
              <span className="text-sm text-slate-600 dark:text-slate-400">{imagePlaceholder}</span>
            </div>

            {/* List */}
            <ul className="space-y-2">
              {notesList.map((note, idx) => (
                <li key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300 text-sm hover:text-cyan-400 dark:hover:text-cyan-400 transition-colors duration-200 cursor-pointer">
                  <span className="text-cyan-400 dark:text-cyan-400 mt-1">•</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
