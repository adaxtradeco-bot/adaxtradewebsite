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
  orgNodes?: OrgNode[];
  notesTitle?: string;
  notesDescription?: string;
  notesList: string[];
  imagePlaceholder?: string;
  videoSrc?: string;
  mediaType?: 'image' | 'video';
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
  imagePlaceholder = 'Drop your architecture diagram / infographic here',
  videoSrc,
  mediaType = 'image'
}: InfographicNWMSectionProps) {
  const positionClasses = {
    'top-left': 'top-[8%] left-[8%]',
    'top-right': 'top-[8%] right-[8%]',
    'bottom-left': 'bottom-[8%] left-[8%]',
    'bottom-right': 'bottom-[8%] right-[8%]'
  };

  return (
    <section className="py-12 md:py-20 px-4 md:px-6 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      {/* Decorative separator */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
      <div className="hidden md:block absolute top-1/3 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-8 md:mb-12">
          <span className="text-xs uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-2 md:mb-3 block">{eyebrow}</span>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-3 md:mb-4">{title}</h2>
          <p className="text-base md:text-lg text-slate-700 dark:text-slate-300">{description}</p>
        </div>

        {/* Layout */}
        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_1fr] gap-6 md:gap-10 items-center">
          {/* Media Content */}
          <div className="w-full">
            <div className="rounded-xl md:rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-gradient-to-br from-cyan-500/10 to-violet-500/10 dark:from-cyan-500/10 dark:to-violet-500/10 p-4 md:p-6 text-center hover:border-solid transition-all duration-300">
              {mediaType === 'video' && videoSrc ? (
                <video 
                  className="w-full h-auto rounded-lg shadow-lg max-h-96"
                  controls
                  preload="metadata"
                  poster={imagePlaceholder}
                >
                  <source src={videoSrc} type="video/mp4" />
                  <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400">
                    مرورگر شما از پخش ویدیو پشتیبانی نمیکند.
                  </p>
                </video>
              ) : videoSrc && (videoSrc.includes('.jpg') || videoSrc.includes('.png') || videoSrc.includes('.gif') || videoSrc.includes('.webp')) ? (
                <img 
                  src={videoSrc} 
                  alt="Architecture diagram" 
                  className="w-full h-auto rounded-lg shadow-lg max-h-96 object-contain"
                />
              ) : (
                <span className="text-xs md:text-sm text-slate-600 dark:text-slate-400">{imagePlaceholder}</span>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-2 md:mb-3">{notesTitle}</h3>
            {notesDescription && (
              <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 mb-3 md:mb-4">{notesDescription}</p>
            )}

            {/* List */}
            <ul className="space-y-2">
              {notesList.map((note, idx) => (
                <li key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300 text-xs md:text-sm hover:text-cyan-400 dark:hover:text-cyan-400 transition-colors duration-200 cursor-pointer">
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
