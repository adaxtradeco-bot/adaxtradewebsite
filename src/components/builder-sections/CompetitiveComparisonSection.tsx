/**
 * Competitive Comparison Table Section
 * Author: Amazon Q
 * Created: 2024-01-20
 */
'use client';

import React from 'react';

interface ComparisonRow {
  feature: string;
  ivaflow: string;
  competitor1: string;
  competitor2: string;
  ivaflowStatus: 'check' | 'cross' | 'text';
  competitor1Status: 'check' | 'cross' | 'text';
  competitor2Status: 'check' | 'cross' | 'text';
}

interface CompetitiveComparisonSectionProps {
  data: {
    eyebrow?: string;
    title?: string;
    highlightedTitle?: string;
    lead?: string;
    competitor1Name?: string;
    competitor2Name?: string;
    rows?: ComparisonRow[];
  };
  style?: {
    backgroundColor?: string;
    textColor?: string;
    padding?: string;
  };
}

export default function CompetitiveComparisonSection({
  data,
  style,
}: CompetitiveComparisonSectionProps) {
  const rows = data.rows || [];

  const renderCell = (
    value: string,
    status: 'check' | 'cross' | 'text',
    isHighlight: boolean = false
  ) => {
    if (status === 'check') {
      return (
        <span
          className={`font-bold ${isHighlight ? 'text-green-600 dark:text-green-400' : 'text-green-700 dark:text-green-500'}`}
        >
          ✓ {value}
        </span>
      );
    }
    if (status === 'cross') {
      return (
        <span className="font-bold text-red-500 dark:text-red-400">
          ✗ {value}
        </span>
      );
    }
    return <span className={isHighlight ? 'font-semibold' : ''}>{value}</span>;
  };

  return (
    <section
      className={`py-20 border-t border-slate-200/70 dark:border-white/5 ${style?.backgroundColor || 'bg-slate-50 dark:bg-slate-900'} ${style?.textColor || 'text-slate-900 dark:text-white'} ${style?.padding || ''}`}
    >
      <div className="max-w-6xl mx-auto px-8">
        {data.eyebrow && (
          <div className="text-xs font-semibold tracking-widest uppercase text-indigo-600 dark:text-indigo-300 mb-3">
            {data.eyebrow}
          </div>
        )}

        <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-3">
          {data.title}
          {data.highlightedTitle && (
            <>
              {' '}
              <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 bg-clip-text text-transparent">
                {data.highlightedTitle}
              </span>
            </>
          )}
        </h2>

        {data.lead && (
          <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mb-12">
            {data.lead}
          </p>
        )}

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-900/50">
                  <th className="text-left p-4 font-bold text-sm border-b border-slate-200 dark:border-white/5">
                    Feature
                  </th>
                  <th className="text-left p-4 font-bold text-sm border-b border-slate-200 dark:border-white/5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300">
                    Ivaflow
                  </th>
                  <th className="text-left p-4 font-bold text-sm border-b border-slate-200 dark:border-white/5">
                    {data.competitor1Name || 'Competitor 1'}
                  </th>
                  <th className="text-left p-4 font-bold text-sm border-b border-slate-200 dark:border-white/5">
                    {data.competitor2Name || 'Competitor 2'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors"
                  >
                    <td className="p-4 text-sm border-b border-slate-200 dark:border-white/5">
                      {row.feature}
                    </td>
                    <td className="p-4 text-sm border-b border-slate-200 dark:border-white/5 bg-indigo-500/5">
                      {renderCell(row.ivaflow, row.ivaflowStatus, true)}
                    </td>
                    <td className="p-4 text-sm border-b border-slate-200 dark:border-white/5">
                      {renderCell(row.competitor1, row.competitor1Status)}
                    </td>
                    <td className="p-4 text-sm border-b border-slate-200 dark:border-white/5">
                      {renderCell(row.competitor2, row.competitor2Status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
