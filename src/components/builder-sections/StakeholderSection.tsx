'use client';

import React from 'react';

interface Stakeholder {
  title: string;
  image: string;
  quote: string;
  solution: string;
}

interface StakeholderSectionProps {
  data: {
    title: string;
    subtitle?: string;
    description?: string;
    stakeholders: Stakeholder[];
  };
  style: {
    backgroundColor: string;
    textColor: string;
    padding: string;
    alignment: string;
  };
}

export default function StakeholderSection({ data, style }: StakeholderSectionProps) {
  return (
    <section className={`${style.backgroundColor} ${style.textColor} ${style.padding}`}>
      <div className="container mx-auto px-4 max-w-7xl">
        <div className={`text-${style.alignment} mb-12`}>
          {data.subtitle && (
            <span className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-sm uppercase tracking-wide rounded-full mb-6">
              {data.subtitle}
            </span>
          )}
          <h2 className="text-4xl font-black mb-4">{data.title}</h2>
          {data.description && <p className="text-lg opacity-80">{data.description}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {data.stakeholders.map((stakeholder, index) => (
            <div
              key={index}
              className="relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 text-center transition-all duration-300 hover:-translate-y-3 hover:scale-105 hover:shadow-2xl hover:border-blue-500 overflow-hidden"
            >
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 w-16 h-1.5 bg-gradient-to-r from-yellow-400 to-yellow-200 rounded-full animate-pulse" />
              
              <div className="mb-6">
                <img
                  src={stakeholder.image}
                  alt={stakeholder.title}
                  className="w-3/4 max-w-[210px] mx-auto h-auto object-contain filter drop-shadow-lg transition-transform duration-300 hover:scale-110"
                />
              </div>
              
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-3">
                {stakeholder.title}
              </h3>
              
              <p className="text-slate-600 dark:text-slate-400 italic mb-4">
                "{stakeholder.quote}"
              </p>
              
              <p className="text-blue-600 dark:text-blue-400 font-bold">
                {stakeholder.solution}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
