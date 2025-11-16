'use client';

import Image from 'next/image';

interface CaseStudy {
  id: string;
  company: string;
  logo?: string;
  industry: string;
  challenge: string;
  solution: string;
  results: string[];
  image?: string;
}

interface CaseStudySectionProps {
  data: {
    title: string;
    subtitle?: string;
    caseStudies: CaseStudy[];
  };
  style?: {
    layout?: 'grid' | 'carousel';
  };
}

export default function CaseStudySection({ data, style = { layout: 'grid' } }: CaseStudySectionProps) {
  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            {data.title}
          </h2>
          {data.subtitle && (
            <p className="text-lg text-slate-600 dark:text-slate-400">
              {data.subtitle}
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {data.caseStudies.map((study) => (
            <div
              key={study.id}
              className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:shadow-xl dark:hover:shadow-slate-700/50 transition-all"
            >
              {study.image && (
                <div className="relative h-48 bg-slate-200 dark:bg-slate-700">
                  <Image
                    src={study.image}
                    alt={study.company}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              
              <div className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  {study.logo && (
                    <div className="relative w-16 h-16">
                      <Image
                        src={study.logo}
                        alt={study.company}
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {study.company}
                    </h3>
                    <p className="text-violet-600 dark:text-violet-400">
                      {study.industry}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                      Challenge
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400">
                      {study.challenge}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                      Solution
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400">
                      {study.solution}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                      Results
                    </h4>
                    <ul className="space-y-2">
                      {study.results.map((result, index) => (
                        <li key={index} className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
                          <span className="text-green-500 mt-1">✓</span>
                          {result}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
