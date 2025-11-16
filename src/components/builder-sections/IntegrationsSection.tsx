'use client';

import React from 'react';

interface Integration {
  name: string;
  icon: string;
  description: string;
}

interface IntegrationsSectionProps {
  data: {
    title: string;
    subtitle?: string;
    integrations: Integration[];
  };
  style: {
    backgroundColor: string;
    textColor: string;
    padding: string;
    alignment: string;
  };
}

export default function IntegrationsSection({ data, style }: IntegrationsSectionProps) {
  return (
    <section className={`${style.backgroundColor} ${style.textColor} ${style.padding}`}>
      <div className="container mx-auto px-4 max-w-7xl">
        <div className={`text-${style.alignment} mb-12`}>
          <h2 className="text-4xl font-bold mb-4">{data.title}</h2>
          {data.subtitle && <p className="text-lg opacity-80">{data.subtitle}</p>}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {data.integrations.map((integration, index) => (
            <div
              key={index}
              className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center"
            >
              <div className="text-4xl mb-3">{integration.icon}</div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                {integration.name}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {integration.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
