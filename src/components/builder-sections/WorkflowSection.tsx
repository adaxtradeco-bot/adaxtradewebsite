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
    <section
      className={`${style.backgroundColor} ${style.textColor} ${style.padding} dark:bg-slate-900 dark:text-white`}
    >
      <div className="container mx-auto px-4 max-w-7xl">
        <div className={`text-${style.alignment} mb-14`}>
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">{data.title}</h2>
          {data.subtitle && (
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-3xl mx-auto">
              {data.subtitle}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.workflows.map((workflow, index) => (
            <div
              key={index}
              className="group bg-slate-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 rounded-2xl p-7 border border-slate-100 dark:border-slate-700 hover:border-blue-100 dark:hover:border-blue-900 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="min-w-[52px] min-h-[52px] rounded-xl bg-blue-50 dark:bg-blue-900/30 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 flex items-center justify-center text-3xl transition-colors duration-200">
                  {workflow.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                    {workflow.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {workflow.description}
                  </p>
                </div>
              </div>

              <div className="space-y-0">
                {workflow.steps.map((step, idx) => (
                  <div key={idx} className="flex items-stretch gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-7 h-7 rounded-full bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm">
                        {idx + 1}
                      </div>
                      {idx < workflow.steps.length - 1 && (
                        <div className="w-px flex-1 bg-blue-100 dark:bg-blue-900/50 my-1" />
                      )}
                    </div>
                    <div
                      className={`text-sm text-slate-700 dark:text-slate-300 font-medium ${
                        idx < workflow.steps.length - 1 ? 'pb-3' : ''
                      }`}
                    >
                      {step}
                    </div>
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
