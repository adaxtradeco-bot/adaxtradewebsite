/**
 * Metrics Section - Display business impact metrics
 */

interface Metric {
  value: string;
  label: string;
}

interface MetricsSectionProps {
  title: string;
  description: string;
  metrics: Metric[];
  backgroundColor?: string;
  textColor?: string;
}

export default function MetricsSection({
  title,
  description,
  metrics,
  backgroundColor = 'bg-slate-50 dark:bg-slate-900',
  textColor = 'text-slate-900 dark:text-white'
}: MetricsSectionProps) {
  return (
    <section className={`${backgroundColor} ${textColor} py-16`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {title}
          </h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            {description}
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <div 
              key={index}
              className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 text-center hover:-translate-y-1 transition-transform shadow-sm hover:shadow-lg"
            >
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">{metric.value}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{metric.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
