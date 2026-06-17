'use client';

import React from 'react';
import { IconDisplay, type IconConfig } from '@/components/ui/IconPicker';

export interface WorkflowLink {
  href: string;
  label: string;
  style: 'button' | 'text-icon';
}

export interface WorkflowItem {
  title: string;
  description: string;
  icon: string;
  faIcon?: IconConfig;
  steps: string[];
  link?: WorkflowLink;
}

export type CardTheme = 'default' | 'flat' | 'elevated' | 'bordered';

interface WorkflowSectionProps {
  data: {
    title: string;
    subtitle?: string;
    workflows: WorkflowItem[];
    cardTheme?: CardTheme;
  };
  style: {
    backgroundColor: string;
    textColor: string;
    padding: string;
    alignment: string;
  };
}

function WorkflowIcon({ workflow }: { workflow: WorkflowItem }) {
  if (workflow.faIcon?.name) {
    return <IconDisplay icon={workflow.faIcon} />;
  }
  return <span>{workflow.icon || '⚙️'}</span>;
}

function CardLink({ link }: { link: WorkflowLink }) {
  if (link.style === 'button') {
    return (
      <a
        href={link.href}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
      >
        {link.label}
        <i className="fa-solid fa-arrow-right text-xs" aria-hidden="true" />
      </a>
    );
  }
  return (
    <a
      href={link.href}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors group/link"
    >
      {link.label}
      <i className="fa-solid fa-arrow-right text-xs transition-transform group-hover/link:translate-x-0.5" aria-hidden="true" />
    </a>
  );
}

function StepList({ steps }: { steps: string[] }) {
  return (
    <div className="space-y-0">
      {steps.map((step, idx) => (
        <div key={idx} className="flex items-stretch gap-3">
          <div className="flex flex-col items-center">
            <div className="w-7 h-7 rounded-full bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm">
              {idx + 1}
            </div>
            {idx < steps.length - 1 && (
              <div className="w-px flex-1 bg-blue-100 dark:bg-blue-900/50 my-1" />
            )}
          </div>
          <div className={`text-sm text-slate-700 dark:text-slate-300 font-medium ${idx < steps.length - 1 ? 'pb-3' : ''}`}>
            {step}
          </div>
        </div>
      ))}
    </div>
  );
}

function DefaultCard({ workflow }: { workflow: WorkflowItem }) {
  return (
    <div className="group bg-slate-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 rounded-2xl p-7 border border-slate-100 dark:border-slate-700 hover:border-blue-100 dark:hover:border-blue-900 hover:shadow-xl transition-all duration-300">
      <div className="flex items-start gap-4 mb-6">
        <div className="min-w-[52px] min-h-[52px] rounded-xl bg-blue-50 dark:bg-blue-900/30 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 flex items-center justify-center text-3xl transition-colors duration-200">
          <WorkflowIcon workflow={workflow} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">{workflow.title}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{workflow.description}</p>
        </div>
      </div>
      <StepList steps={workflow.steps} />
      {workflow.link?.href && (
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700">
          <CardLink link={workflow.link} />
        </div>
      )}
    </div>
  );
}

function FlatCard({ workflow }: { workflow: WorkflowItem }) {
  return (
    <div className="py-7 flex gap-5">
      <div className="min-w-[48px] min-h-[48px] rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-2xl flex-shrink-0">
        <WorkflowIcon workflow={workflow} />
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{workflow.title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">{workflow.description}</p>
        <StepList steps={workflow.steps} />
        {workflow.link?.href && (
          <div className="mt-4">
            <CardLink link={workflow.link} />
          </div>
        )}
      </div>
    </div>
  );
}

function ElevatedCard({ workflow }: { workflow: WorkflowItem }) {
  return (
    <div className="group bg-white dark:bg-slate-800 rounded-2xl p-7 shadow-md hover:shadow-2xl transition-all duration-300 border border-slate-100 dark:border-slate-700">
      <div className="flex items-start gap-4 mb-6">
        <div className="min-w-[52px] min-h-[52px] rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 group-hover:from-blue-100 group-hover:to-indigo-100 dark:group-hover:from-blue-900/50 dark:group-hover:to-indigo-900/50 flex items-center justify-center text-3xl transition-colors duration-200">
          <WorkflowIcon workflow={workflow} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">{workflow.title}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{workflow.description}</p>
        </div>
      </div>
      <StepList steps={workflow.steps} />
      {workflow.link?.href && (
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700">
          <CardLink link={workflow.link} />
        </div>
      )}
    </div>
  );
}

function BorderedCard({ workflow }: { workflow: WorkflowItem }) {
  return (
    <div className="group bg-white dark:bg-slate-800 rounded-xl p-6 border-l-4 border-blue-500 dark:border-blue-400 shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-100 dark:border-slate-700 border-l-blue-500 dark:border-l-blue-400">
      <div className="flex items-start gap-4 mb-5">
        <div className="min-w-[44px] min-h-[44px] rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-2xl flex-shrink-0">
          <WorkflowIcon workflow={workflow} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">{workflow.title}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{workflow.description}</p>
        </div>
      </div>
      <StepList steps={workflow.steps} />
      {workflow.link?.href && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
          <CardLink link={workflow.link} />
        </div>
      )}
    </div>
  );
}

export default function WorkflowSection({ data, style }: WorkflowSectionProps) {
  const cardTheme: CardTheme = data.cardTheme ?? 'default';

  const sectionClass = `${style.backgroundColor} ${style.textColor} ${style.padding} dark:bg-slate-900 dark:text-white`;

  const header = (
    <div className={`text-${style.alignment} mb-14`}>
      <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">{data.title}</h2>
      {data.subtitle && (
        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-3xl mx-auto">{data.subtitle}</p>
      )}
    </div>
  );

  if (cardTheme === 'flat') {
    return (
      <section className={sectionClass}>
        <div className="container mx-auto px-4 max-w-4xl">
          {header}
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {data.workflows.map((workflow, index) => (
              <FlatCard key={index} workflow={workflow} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const CardComponent = cardTheme === 'elevated' ? ElevatedCard
    : cardTheme === 'bordered' ? BorderedCard
    : DefaultCard;

  return (
    <section className={sectionClass}>
      <div className="container mx-auto px-4 max-w-7xl">
        {header}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.workflows.map((workflow, index) => (
            <CardComponent key={index} workflow={workflow} />
          ))}
        </div>
      </div>
    </section>
  );
}
