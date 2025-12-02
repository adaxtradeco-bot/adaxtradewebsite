'use client';

interface RequirementsSectionProps {
  data: {
    title: string;
    description?: string;
    requirements: string[];
    visualIcon?: string;
  };
  style?: {
    backgroundColor?: string;
    padding?: string;
  };
}

export default function RequirementsSection({ data, style }: RequirementsSectionProps) {
  return (
    <section className={`${style?.padding || 'py-16 px-6'} ${style?.backgroundColor || 'bg-white dark:bg-slate-900'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">{data.title}</h2>
            {data.description && (
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">{data.description}</p>
            )}
            <ul className="space-y-4">
              {data.requirements.map((req, idx) => (
                <li
                  key={idx}
                  className="flex items-center gap-3 py-3 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                >
                  <span className="text-blue-600 dark:text-blue-400 font-bold text-xl">→</span>
                  {req}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-2xl min-h-[300px] flex items-center justify-center border border-slate-700 shadow-2xl">
            <div className="text-8xl filter drop-shadow-2xl">
              {data.visualIcon || '🤝'}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
