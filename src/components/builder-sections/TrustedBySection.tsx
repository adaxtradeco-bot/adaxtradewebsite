'use client';

interface TrustedBySectionProps {
  data: {
    title?: string;
    subtitle?: string;
    logos?: Array<{
      name: string;
      icon: string;
    }>;
    stats?: Array<{
      value: string;
      label: string;
    }>;
    backgroundColor?: string;
  };
  isBuilder?: boolean;
}

export function TrustedBySection({ data, isBuilder = false }: TrustedBySectionProps) {
  const {
    title = 'Trusted by Industry Leaders',
    subtitle = 'Join 10,000+ companies',
    logos = [],
    stats = [],
    backgroundColor = 'bg-white dark:bg-neutral-900'
  } = data;

  return (
    <section className={`py-16 px-6 ${backgroundColor} border-y border-slate-200 dark:border-neutral-800`}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
            {subtitle}
          </p>
          <h2 className="text-3xl font-bold">{title}</h2>
        </div>

        {/* Logos */}
        {logos.length > 0 && (
          <div className="flex flex-wrap justify-center items-center gap-8 mb-12">
            {logos.map((logo, idx) => (
              <div
                key={idx}
                className="flex items-center justify-center w-32 h-20 text-4xl grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300 hover:scale-110"
                title={logo.name}
              >
                {logo.icon}
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        {stats.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="text-center p-6 rounded-xl bg-slate-50 dark:bg-neutral-800 hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
