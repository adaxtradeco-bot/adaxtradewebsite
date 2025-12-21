'use client';

import React, { useState } from 'react';
import { SmartImage } from '@/components/ui/SmartImage';

interface ExperienceTab {
  id: string;
  label: string;
  icon: string;
  title: string;
  description: string;
  image: string | { src: string; alt?: string; maxWidth?: string | number; maxHeight?: string | number; objectFit?: string };
  link: string;
}

interface ExperienceTabsSectionProps {
  data: {
    title: string;
    subtitle?: string;
    description?: string;
    tabs: ExperienceTab[];
  };
  style: {
    backgroundColor: string;
    textColor: string;
    padding: string;
  };
}

export default function ExperienceTabsSection({ data, style }: ExperienceTabsSectionProps) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section className={`${style.backgroundColor} ${style.textColor} ${style.padding}`}>
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-12">
          {data.subtitle && (
            <span className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-sm uppercase tracking-wide rounded-full mb-6">
              {data.subtitle}
            </span>
          )}
          <h2 className="text-4xl font-black mb-4">{data.title}</h2>
          {data.description && <p className="text-lg opacity-80">{data.description}</p>}
        </div>

        <div className="flex justify-center gap-4 mb-12 flex-wrap">
          {data.tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(index)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${
                activeTab === index
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700 bg-black aspect-video">
          <SmartImage
            src={data.tabs[activeTab].image}
            alt={data.tabs[activeTab].title}
            className="w-full h-full"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/10 flex flex-col justify-end p-12">
            <h3 className="text-4xl font-black text-white mb-4">
              {data.tabs[activeTab].title}
            </h3>
            <p className="text-xl text-white/90 mb-6 max-w-3xl leading-relaxed">
              {data.tabs[activeTab].description}
            </p>
            <a
              href={data.tabs[activeTab].link}
              className="inline-flex items-center gap-2 bg-yellow-500 text-black px-8 py-3 rounded-lg font-extrabold transition-all hover:shadow-lg hover:-translate-y-1 w-fit"
            >
              Explore →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
