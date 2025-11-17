/**
 * Two Column Media Section - Content on one side, media/placeholder on other
 */

interface Feature {
  text: string;
}

interface TwoColumnMediaSectionProps {
  title: string;
  description: string;
  features: Feature[];
  mediaIcon?: string;
  mediaText?: string;
  mediaPosition?: 'left' | 'right';
  backgroundColor?: string;
  textColor?: string;
  pattern?: boolean;
  badge?: string;
}

export default function TwoColumnMediaSection({
  title,
  description,
  features,
  mediaIcon = '🔄',
  mediaText = 'Workflow Builder Screenshot',
  mediaPosition = 'right',
  backgroundColor = 'bg-gradient-to-br from-cyan-50/80 via-white to-slate-50/50 dark:bg-gradient-to-b dark:from-cyan-500/5 dark:to-transparent',
  textColor = 'text-slate-900 dark:text-white',
  pattern = true,
  badge
}: TwoColumnMediaSectionProps) {
  const contentOrder = mediaPosition === 'right' ? 'order-1' : 'order-2';
  const mediaOrder = mediaPosition === 'right' ? 'order-2' : 'order-1';

  return (
    <section className={`${backgroundColor} py-16 relative`}>
      {pattern && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(6,182,212,0.08)_1px,transparent_0)] dark:bg-none" style={{backgroundSize: '20px 20px'}} />
      )}
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className={`${textColor} ${contentOrder}`}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">{description}</p>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="p-4 rounded-xl bg-white/80 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                >
                  <p className="text-sm text-slate-700 dark:text-slate-300">{feature.text}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className={mediaOrder}>
            <div className="aspect-[4/3] bg-white/80 dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-white/10 flex items-center justify-center">
              <div className="text-center text-slate-600 dark:text-slate-400">
                <div className="text-4xl mb-2">{mediaIcon}</div>
                <p className="text-sm">{mediaText}</p>
              </div>
            </div>
            {badge && (
              <div className="mt-3 text-center">
                <span className="inline-flex items-center text-xs px-3 py-1 rounded-full bg-white/10 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300">
                  {badge}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
