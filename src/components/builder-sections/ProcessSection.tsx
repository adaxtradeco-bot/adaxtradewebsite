'use client';

import React from 'react';

interface Step {
  title: string;
  description: string;
  icon: string;
}

interface ProcessSectionProps {
  data: {
    title: string;
    subtitle?: string;
    steps: Step[];
  };
  style: {
    backgroundColor: string;
    textColor: string;
    padding: string;
    alignment: string;
  };
}

export default function ProcessSection({ data, style }: ProcessSectionProps) {
  return (
    <section className={`${style.backgroundColor} ${style.textColor} ${style.padding}`}>
      <div className="container mx-auto px-4 max-w-7xl">
        <div className={`text-${style.alignment} mb-16`}>
          <h2 className="text-4xl font-bold mb-4">{data.title}</h2>
          {data.subtitle && <p className="text-lg opacity-80">{data.subtitle}</p>}
        </div>

        <div className="relative">
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transform -translate-y-1/2" />
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {data.steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    {step.description}
                  </p>
                </div>
                
                {index < data.steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-2xl text-blue-500">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
