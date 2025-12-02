'use client';

interface FeatureCard {
  title: string;
  description: string;
}

interface FeaturesGridNWMSectionProps {
  eyebrow?: string;
  title: string;
  description: string;
  features: FeatureCard[];
}

export default function FeaturesGridNWMSection({
  eyebrow = 'Core capabilities',
  title,
  description,
  features = []
}: FeaturesGridNWMSectionProps) {
  return (
    <section className="py-20 px-6 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      {/* Decorative separator and gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/3 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-12">
          <span className="text-xs uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-3 block">{eyebrow}</span>
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">{title}</h2>
          <p className="text-lg text-slate-700 dark:text-slate-300">{description}</p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-white/90 dark:bg-slate-900/60 p-6 backdrop-blur-sm hover:border-cyan-500/50 dark:hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/20 hover:-translate-y-1 hover:scale-[1.02] transition-all duration-500 group cursor-pointer"
            >
              {/* Decorative glow - stronger on hover */}
              <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-violet-500/20 dark:bg-violet-500/20 blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Glass gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-violet-500/0 group-hover:from-cyan-500/5 group-hover:to-violet-500/5 transition-all duration-500" />
              
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 relative z-10 group-hover:text-cyan-400 dark:group-hover:text-cyan-400 transition-colors duration-300">{feature.title}</h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 relative z-10">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
