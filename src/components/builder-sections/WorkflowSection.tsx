'use client';

import React from 'react';

interface Workflow {
  title: string;
  description: string;
  icon: string;
  steps: string[];
}

interface WorkflowSectionProps {
  data: {
    title: string;
    subtitle?: string;
    workflows: Workflow[];
  };
  style: {
    backgroundColor: string;
    textColor: string;
    padding: string;
    alignment: string;
  };
}

export default function WorkflowSection({ data, style }: WorkflowSectionProps) {
  return (
    <section className={`${style.backgroundColor} ${style.textColor} ${style.padding}`}>
      <div className="container mx-auto px-4 max-w-7xl">
        <div className={`text-${style.alignment} mb-12`}>
          <h2 className="text-4xl font-bold mb-4">{data.title}</h2>
          {data.subtitle && <p className="text-lg opacity-80">{data.subtitle}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {data.workflows.map((workflow, index) => (
            <div key={index} className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg">
              <div className="text-5xl mb-4">{workflow.icon}</div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                {workflow.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">{workflow.description}</p>
              
              <div className="space-y-3">
                {workflow.steps.map((step, idx) => (
                  <div key={idx} className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center font-semibold text-sm">
                      {idx + 1}
                    </div>
                    <span className="text-slate-700 dark:text-slate-300">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
